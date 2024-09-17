import Head from "next/head";
import { useState } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../components/withAuth';
import { useAuth } from '../contexts/AuthContext';
import styles2 from './styles/estilistas.module.css';
import Link from 'next/link';

const PaginaProtegida = () => {
  const [currentPage, setCurrentPage] = useState('estilistas');
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
    <Head>
        <title>E-GO</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={styles2.header}>
        <h1 className={styles2.title}>Dashboard</h1>
        <button className={styles2.logoutButton} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>
      <div className={styles2.container}>
        <div className="grid">

          <Link href="/estilistas">
            <div className="card">
              <h3>Estilistas</h3>
              <p></p>
            </div>
          </Link>

          <Link href="/listadoStylist" passHref>
            <div className="card"  >
              <h3>Aprobar Documentos Estilistas</h3>
              <p></p>
            </div>
          </Link>

          <Link href="/admin/pending-payments" passHref>
            <div className="card"  >
              <h3>Payments;</h3>
              <p>Pending Payments</p>
            </div>
          </Link>

          <Link href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app" passHref>
            <div className="card"  >
              <h3>Deploy &rarr;</h3>
              <p>
                Instantly deploy your Next.js site to a public URL with Vercel.
              </p>
            </div>
          </Link>

          <style jsx>{`
            .container {
              min-height: 100vh;
              padding: 0 1rem;
              display: flex;
              flex-direction: column;
              align-items: center;
              background: #f9f9f9;
            }

            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 1.5rem;
              max-width: 1200px;
              width: 100%;
              margin-top: 2rem;
            }

            .card {
              padding: 1.5rem;
              text-align: left;
              background: white;
              color: #333;
              border: 1px solid #eaeaea;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              transition: all 0.3s ease;
            }

            .card:hover,
            .card:focus {
              border-color: #0070f3;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
              color: #0070f3;
            }

            .card h3 {
              margin: 0 0 0.5rem 0;
              font-size: 1.25rem;
            }

            .card p {
              margin: 0;
              font-size: 1rem;
              line-height: 1.4;
            }

            @media (max-width: 768px) {
              .grid {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              }
            }

            @media (max-width: 480px) {
              .card {
                padding: 1rem;
              }

              .card h3 {
                font-size: 1rem;
              }

              .card p {
                font-size: 0.875rem;
              }
            }
          `}</style>
        </div>
      </div>
    </>
  );
};

export default withAuth(PaginaProtegida);

