import Head from "next/head";
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import withAuth from '../components/withAuth';
import { useAuth } from '../contexts/AuthContext';
import clientPromise from "../lib/mongodb";
import styles from './styles/estilistas.module.css';
import { useEffect } from "react";

interface Estilista {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  phoneNumber: string;
  profilePictureUrl: string;
  hasActiveSubscription: boolean;
  specialties: string[];
  rates: { [key: string]: number };
  ratings: { average: number };
  verificationStatus: string;
  geoLocation: {
    type: string;
    coordinates: number[];
  };
}

interface EstilistasPageProps {
  estilistas: Estilista[];
}

const EstilistasPage: React.FC<EstilistasPageProps> = ({ estilistas }) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Forzar la recarga si no hay estilistas
  useEffect(() => {
    if (estilistas.length === 0) {
      router.reload(); // Recargar la página si no hay estilistas
    }
  }, [estilistas, router]);

  return (
    <>
      <Head>
        <title>E-GO</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Lista de Estilistas</h1>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </header>

        {estilistas.length > 0 ? (
          <div className={styles.estilistasGrid}>
            {estilistas.map((estilista) => (
              <div key={estilista._id} className={styles.estilistaCard}>
                <h2 className={styles.estilistaName}>
                  {estilista.firstName} {estilista.lastName}
                </h2>
                <p className={styles.estilistaInfo}>
                  Teléfono: {estilista.phoneNumber}
                </p>
                <p className={styles.estilistaInfo}>
                  Fecha de nacimiento: {new Date(estilista.birthdate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className={styles.estilistaInfo}>
                  Suscripción activa: {estilista.hasActiveSubscription ? 'Sí' : 'No'}
                </p>
                <p className={styles.estilistaInfo}>
                  Especialidades: {estilista.specialties.join(', ')}
                </p>
                <p className={styles.estilistaInfo}>Tarifas:</p>
                <ul className={styles.estilistaRates}>
                  {estilista.rates && Object.entries(estilista.rates).length > 0 ? (
                    Object.entries(estilista.rates).map(([service, rate]) => (
                      <li key={service}>
                        {service}: ${rate}
                      </li>
                    ))
                  ) : (
                    <li>No se han proporcionado tarifas</li>
                  )}
                </ul>
                <p className={styles.estilistaInfo}>
                  Calificación promedio: {estilista.ratings.average}
                </p>
                <p className={styles.estilistaInfo}>
                  Estado de verificación: {estilista.verificationStatus}
                </p>
                <p className={styles.estilistaInfo}>
                  Ubicación: Lat {estilista.geoLocation.coordinates[1]}, Lon{' '}
                  {estilista.geoLocation.coordinates[0]}
                </p>
                <img
                  className={styles.estilistaImage}
                  src={estilista.profilePictureUrl}
                  alt={`${estilista.firstName} ${estilista.lastName}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>No hay estilistas disponibles en este momento.</p>
        )}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Deshabilitar cache para evitar inconsistencias
  context.res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );

  try {
    const client = await clientPromise;
    const db = client.db("estilistas_go");

    const estilistasDocs = await db.collection('stylist').find({}).toArray();

    return {
      props: {
        estilistas: JSON.parse(JSON.stringify(estilistasDocs)),
      },
    };
  } catch (error) {
    console.error('Error fetching estilistas:', error);
    return {
      props: {
        estilistas: [],
      },
    };
  }
};

export default withAuth(EstilistasPage);
