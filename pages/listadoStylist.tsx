import Head from "next/head";
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import withAuth from '../components/withAuth';
import { useAuth } from '../contexts/AuthContext';
import client from "../lib/mongodb";
import styles from './styles/estilistas.module.css';
import { ObjectId } from 'mongodb';

interface Document {
    _id: string;
    documentUrl: string;
    documentStatus: string;
    tag: string;
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
                                            <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer">
                                                Ver documento
                                            </a>
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

        // Para cada estilista, obtener sus documentos relacionados
        const estilistasConDocumentos = await Promise.all(estilistasDocs.map(async (estilista: any) => {
            // Si el estilista._id ya es un ObjectId, lo usamos directamente, de lo contrario lo convertimos
            //const stylistObjectId = typeof estilista._id === 'string' ? new ObjectId(estilista._id) : estilista._id;
            const stylistObjectId = new ObjectId(estilista._id);

            // Buscar documentos relacionados con el stylistId
            const documents = await db.collection('stylistdocumentmoderations')
                .find({ stylistId: stylistObjectId })
                .toArray();

            // console.log(`Documentos para estilista ${estilista._id}:`, documents);

            // console.log(`Stylist ID: ${estilista._id}, ObjectId: ${stylistObjectId}`);
            // console.log("Estilista ID type:", typeof stylistObjectId);


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
        // console.log("con documentos ",estilistasConDocumentos);
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
    } finally {
        await client.close(); // Asegúrate de cerrar la conexión
    }

};

export default withAuth(ListadoStylistPage);
