import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import type { NextPage } from 'next';
import styles from './styles/login.module.css'

const Login: NextPage = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      router.push('/estilistas');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Iniciar Sesión</h1>
        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.label}>Usuario:</label>
          <input
            type="text"
            id="username"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Contraseña:</label>
          <input
            type="password"
            id="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Iniciar sesión
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;