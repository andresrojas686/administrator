import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const WithAuth: React.FC<P> = (props) => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!isAuthenticated) {
        const storedAuth = localStorage.getItem('isLoggedIn');
        if (storedAuth !== 'true') {
          router.push('/login');
        }
      }
      setLoading(false);
    }, [isAuthenticated, router]);

    if (loading) {
      return <div>Cargando...</div>; // O cualquier componente de carga que prefieras
    }

    if (!isAuthenticated && localStorage.getItem('isLoggedIn') !== 'true') {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuth;
};

export default withAuth;