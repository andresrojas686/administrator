// import { useState } from 'react';
// import { useRouter } from 'next/router';
// import withAuth from '../components/withAuth';
// import { useAuth } from '../contexts/AuthContext';
// import EstilistasPage from './estilistas';
// import AprobarDocumentosPage from './aprobar-documentos';
// import styles from './styles/PaginaProtegida.module.css';
// import Link from 'next/link';
// import styles2 from './styles/estilistas.module.css';


// const PaginaProtegida = () => {
//   const [currentPage, setCurrentPage] = useState('estilistas');
//   const { logout } = useAuth();
//   const router = useRouter();

//   const handleLogout = () => {
//     logout();
//     router.push('/');
//   };

//   return (

//     <>
//       <header className={styles2.header}>
//         <h1 className={styles2.title}>Dashboard</h1>
//         <button className={styles2.logoutButton} onClick={handleLogout}>Cerrar sesión</button>
//       </header><div className={styles2.container}>

//         <div className="grid">
          
//             <a href="/estilistas" className="card">
//               <h3>Estilistas list&rarr; </h3>
//               <p>Lorem Ipsum.</p>
//             </a>
          
//           <a href="https://nextjs.org/learn" className="card">
//             <h3>Learn &rarr;</h3>
//             <p>Learn about Next.js in an interactive course with quizzes!</p>
//           </a>

//           <a
//             href="https://github.com/vercel/next.js/tree/canary/examples"
//             className="card"
//           >
//             <h3>Examples &rarr;</h3>
//             <p>Discover and deploy boilerplate example Next.js projects.</p>
//           </a>

//           <a
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="card"
//           >
//             <h3>Deploy &rarr;</h3>
//             <p>
//               Instantly deploy your Next.js site to a public URL with Vercel.
//             </p>
//           </a>

//           <style jsx>{`
        
//         .contenedor-principal {
//             margin: 2cm; /* Margen de 2 cm en todos los lados */
//             /* Puedes agregar más estilos aquí según necesites */
//         }
        
//     `}</style>

//           <style jsx>{`
//         .container {
//           min-height: 100vh;
//           padding: 0 0.5rem;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           align-items: center;
//         }

//         main {
//           padding: 5rem 0;
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           align-items: center;
//         }

//         footer {
//           width: 100%;
//           height: 100px;
//           border-top: 1px solid #eaeaea;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }

//         footer img {
//           margin-left: 0.5rem;
//         }

//         footer a {
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }

//         a {
//           color: inherit;
//           text-decoration: none;
//         }
//         Link {
//           color: inherit;
//           text-decoration: none;
//         }

//         .title a {
//           color: #0070f3;
//           text-decoration: none;
//         }
//         .title Link {
//           color: #0070f3;
//           text-decoration: none;
//         }

//         .title a:hover,
//         .title a:focus,
//         .title a:active {
//           text-decoration: underline;
//         }

//         .title {
//           margin: 0;
//           line-height: 1.15;
//           font-size: 4rem;
//         }

//         .title,
//         .description {
//           text-align: center;
//         }

//         .subtitle {
//           font-size: 2rem;
//         }

//         .description {
//           line-height: 1.5;
//           font-size: 1.5rem;
//         }

//         code {
//           background: #fafafa;
//           border-radius: 5px;
//           padding: 0.75rem;
//           font-size: 1.1rem;
//           font-family:
//             Menlo,
//             Monaco,
//             Lucida Console,
//             Liberation Mono,
//             DejaVu Sans Mono,
//             Bitstream Vera Sans Mono,
//             Courier New,
//             monospace;
//         }

//         .grid {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-wrap: wrap;

//           max-width: 800px;
//           margin-top: 3rem;
//         }

//         .card {
//           margin: 1rem;
//           flex-basis: 45%;
//           padding: 1.5rem;
//           text-align: left;
//           color: inherit;
//           text-decoration: none;
//           border: 1px solid #eaeaea;
//           border-radius: 10px;
//           transition:
//             color 0.15s ease,
//             border-color 0.15s ease;
//         }

//         .card:hover,
//         .card:focus,
//         .card:active {
//           color: #0070f3;
//           border-color: #0070f3;
//         }

//         .card h3 {
//           margin: 0 0 1rem 0;
//           font-size: 1.5rem;
//         }

//         .card p {
//           margin: 0;
//           font-size: 1.25rem;
//           line-height: 1.5;
//         }

//         .logo {
//           height: 1em;
//         }

//         @media (max-width: 600px) {
//           .grid {
//             width: 100%;
//             flex-direction: column;
//           }
//         }
//       `}</style>

//           <style jsx global>{`
//         html,
//         body {
//           padding: 0;
//           margin: 0;
//           font-family:
//             -apple-system,
//             BlinkMacSystemFont,
//             Segoe UI,
//             Roboto,
//             Oxygen,
//             Ubuntu,
//             Cantarell,
//             Fira Sans,
//             Droid Sans,
//             Helvetica Neue,
//             sans-serif;
//         }

//         * {
//           box-sizing: border-box;
//         }
//       `}</style>
//         </div>

//       </div></>
//   );
// };

// export default withAuth(PaginaProtegida);


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
              <h3>Estilistas list&rarr;</h3>
              <p>Lorem Ipsum.</p>
            </div>
          </Link>

          <Link href="https://nextjs.org/learn" passHref>
            <div className="card" target="_blank" rel="noopener noreferrer">
              <h3>Learn &rarr;</h3>
              <p>Learn about Next.js in an interactive course with quizzes!</p>
            </div>
          </Link>

          <Link href="https://github.com/vercel/next.js/tree/canary/examples" passHref>
            <div className="card" target="_blank" rel="noopener noreferrer">
              <h3>Examples &rarr;</h3>
              <p>Discover and deploy boilerplate example Next.js projects.</p>
            </div>
          </Link>

          <Link href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app" passHref>
            <div className="card" target="_blank" rel="noopener noreferrer">
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

