import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import withAuth from '../components/withAuth';
import { useAuth } from '../contexts/AuthContext';

const PaginaProtegida: NextPage = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/'); // Redirige al inicio
  };

  return (
    <div>
      <h1>Página Protegida</h1>
      <p>Esta página solo es accesible para usuarios logueados.</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
};

export default withAuth(PaginaProtegida);