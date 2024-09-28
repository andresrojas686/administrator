import Head from "next/head";
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import withAuth from '../components/withAuth';
import { useAuth } from '../contexts/AuthContext';
import client from "../lib/mongodb";
import styles from './styles/estilistas.module.css';
import { ObjectId } from 'mongodb';
import React, { useState } from 'react';
import Link from "next/link";


interface Document {
    _id?: string;
    documentUrl?: string;
    documentStatus?: string;
    tag?: string;
    stylistId: string;
}

interface Estilista {
    _id: string;
    firstName: string;
    lastName: string;
    documents: Document[];
}

interface ListadoStylistPageProps {
    estilistas: Estilista[];
}

const ListadoStylistPage: React.FC<ListadoStylistPageProps> = ({ estilistas }) => {
    console.log('Estilistas recibidos en el cliente:', estilistas);
    const { logout } = useAuth();
    const router = useRouter();

    // Estado para manejar la visibilidad del modal y el documento seleccionado
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

    // Función para abrir el modal con el documento seleccionado
    const openModal = (document: Document) => {
        console.log("Documento seleccionado:", document); // Verificar que se recibe el documento correcto
        setSelectedDocument(document);
    };

    // Función para cerrar el modal
    const closeModal = () => {
        setSelectedDocument(null);
        router.reload();
    };


    // Función para aprobar el documento
    const handleApprove = async () => {
        if (!selectedDocument) return;

        try {
            const response = await fetch('/api/updateDocumentStatus', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documentId: selectedDocument._id,
                    status: 'Approved',
                }),
            });

            if (response.ok) {
                setSelectedDocument({
                    ...selectedDocument,
                    documentStatus: 'Approved',
                    documentUrl: selectedDocument?.documentUrl || '', // Asegurarte de que siempre haya un valor
                });
                router.reload();
            } else {
                console.error('Error actualizando el estado del documento');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleReject = async () => {
        try {
            const response = await fetch('/api/updateDocumentStatus', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documentId: selectedDocument?._id,
                    status: 'Rejected',
                }),
            });

            if (response.ok) {
                // Actualiza el estado del documento en la interfaz
                setSelectedDocument({
                    ...selectedDocument,
                    documentStatus: 'Rejected',
                    documentUrl: selectedDocument?.documentUrl || '', // Valor predeterminado para documentUrl
                    stylistId: selectedDocument?.stylistId || '', // Proveer un valor predeterminado para stylistId
                });

                router.reload();
            } else {
                console.error('Error actualizando el estado del documento');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <>
            <Head>
                <title>E-GO - Listado de Estilistas</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Listado de Estilistas y Documentos</h1>
                    <Link href="/dashboard">
                        <button className={styles.loginButton} >Dashboard</button>
                    </Link>
                    <button className={styles.logoutButton} onClick={handleLogout}>Cerrar sesión</button>
                </header>
                <div className={styles.estilistasGrid}>
                    {estilistas.map((estilista) => (
                        <div key={estilista._id} className={styles.estilistaCard}>
                            <h2 className={styles.estilistaName}>{estilista.firstName} {estilista.lastName}</h2>
                            <h3 className={styles.documentHeader}>Documentos:</h3>

                            <ul className={styles.documentList}>
                                {estilista.documents && estilista.documents.length > 0 ? (
                                    estilista.documents.map((doc) => (
                                        <li key={doc._id}>
                                            <strong>{doc.tag}:</strong> {doc.documentStatus}
                                            <br />
                                            <a href="#" onClick={() => openModal(doc)}>Ver documento</a>
                                        </li>
                                    ))
                                ) : (
                                    <li>No hay documentos disponibles</li>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal para mostrar la información del documento */}
            {selectedDocument && (
                <>{console.log("Mostrando modal para el documento:", selectedDocument)}
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h2>{selectedDocument.tag}</h2>
                            <img src={selectedDocument.documentUrl} alt="Documento" />
                            <p>Estado: {selectedDocument.documentStatus}</p>

                            {selectedDocument.documentStatus === 'Pending' && (
                                <div>
                                    <button onClick={handleApprove}>Aprobar</button>
                                    <button onClick={handleReject}>Rechazar</button>
                                </div>
                            )}

                            <button onClick={closeModal}>Cerrar</button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        // Conectar a la base de datos
        await client.connect();
        const db = client.db("estilistas_go");

        // Obtener estilistas
        const estilistasDocs = await db.collection('stylist').find({}).toArray();

        // console.log('###########################');
        // console.log('estilistasDocs:', estilistasDocs);


        // Para cada estilista, obtener sus documentos relacionados
        const estilistasConDocumentos = await Promise.all(estilistasDocs.map(async (estilista: any) => {
            const stylistObjectId = new ObjectId(estilista._id);

            // Buscar documentos relacionados con el stylistId
            const documents = await db.collection('stylistdocumentmoderations')
                .find({ stylistId: stylistObjectId })
                .toArray();
            // console.log('###########################');
            // console.log('Documents:', documents);

            return {
                ...estilista,
                documents: documents.map((doc: any) => ({
                    _id: doc._id.toString(),
                    documentUrl: doc.documentUrl,
                    documentStatus: doc.documentStatus,
                    tag: doc.tag,
                    stylistId: doc.stylistId.toString()
                }))
            };
        }));

        return {
            props: {
                estilistas: JSON.parse(JSON.stringify(estilistasConDocumentos)),
            },
        };
    } catch (error) {
        console.error('Error fetching estilistas:', error);
        return {
            props: {
                estilistas: [],
                error: 'Hubo un error al obtener los datos. Por favor, intente más tarde.'
            },
        };
    }

};

export default withAuth(ListadoStylistPage);
