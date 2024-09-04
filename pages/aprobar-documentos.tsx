import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import clientPromise from "../lib/mongodb";
import styles from './styles/AprobarDocumentos.module.css';

interface Estilista {
  _id: string;
  firstName: string;
  lastName: string;
}

interface DocumentoEstilista {
  _id: string;
  stylistId: string;
  documentStatus: string;
  documentUrl: string;
  tag: string;
}

interface EstilistaConDocumento extends Estilista {
  documento?: DocumentoEstilista;
}

const AprobarDocumentosPage = ({ estilistasConDocumentos }: { estilistasConDocumentos: EstilistaConDocumento[] }) => {
  const [estilistas, setEstilistas] = useState(estilistasConDocumentos);

  const handleApproval = async (estilistId: string, documentId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/aprobar-documento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId, newStatus }),
      });

      if (response.ok) {
        setEstilistas(estilistas.map(estilista => {
          if (estilista._id === estilistId && estilista.documento) {
            return { ...estilista, documento: { ...estilista.documento, documentStatus: newStatus } };
          }
          return estilista;
        }));
      } else {
        throw new Error('Error al actualizar el documento');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al procesar la solicitud');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Aprobar Documentos</h1>
      {estilistas.map(estilista => (
        <div key={estilista._id} className={styles.estilistaCard}>
          <h2>{estilista.firstName} {estilista.lastName}</h2>
          {estilista.documento ? (
            <div>
              <p>Documento: {estilista.documento.tag}</p>
              <p>Estado: {estilista.documento.documentStatus}</p>
              <img src={estilista.documento.documentUrl} alt="Documento" className={styles.documentImage} />
              <div className={styles.buttonGroup}>
                <button 
                  onClick={() => handleApproval(estilista._id, estilista.documento!._id, 'Approved')}
                  disabled={estilista.documento.documentStatus === 'Approved'}
                >
                  Aprobar
                </button>
                <button 
                  onClick={() => handleApproval(estilista._id, estilista.documento!._id, 'Rejected')}
                  disabled={estilista.documento.documentStatus === 'Rejected'}
                >
                  Rechazar
                </button>
              </div>
            </div>
          ) : (
            <p>No hay documentos pendientes</p>
          )}
        </div>
      ))}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const client = await clientPromise;
    const db = client.db("estilistas_go");

    const estilistas = await db.collection('stylist').find({}).toArray();
    const documentos = await db.collection('stylistdocumentmoderations').find({}).toArray();

    const estilistasConDocumentos = estilistas.map(estilista => {
      const documento = documentos.find(doc => doc.stylistId.toString() === estilista._id.toString());
      return {
        ...estilista,
        documento: documento || undefined
      };
    });

    return {
      props: {
        estilistasConDocumentos: JSON.parse(JSON.stringify(estilistasConDocumentos)),
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        estilistasConDocumentos: [],
      },
    };
  }
};

export default AprobarDocumentosPage;