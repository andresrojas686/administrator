import { useState } from 'react';
import useSWR from 'swr';
import withAuth from '../../components/withAuth';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import styles from '../styles/PendingPayments.module.css'; // Nuevo archivo de estilos

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Payment {
  id: string;
  accountId: string;
  reference: string;
  currency: string;
  amount: number;
  usedAmount: number;
  status: string;
  countryCodeGateway: string;
  paymentGateway: string;
  paymentGatewayData: {
    referenceNumber: string;
    phoneNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaymentsResponse {
  payments: Payment[];
  totalPayments: number;
}

export default withAuth(function PendingPayments() {
  const { logout } = useAuth();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [totalSelectedAmount, setTotalSelectedAmount] = useState(0);
  const limit = 20;

  // const { data, error } = useSWR<PaymentsResponse>(`/api/admin/payments?page=${page}&limit=${limit}`, fetcher);
  const { data, error } = useSWR<PaymentsResponse>(`/api/admin/payments?page=${page}&limit=${limit}&order=desc`, fetcher);

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => p + 1);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleCheckboxChange = (accountId: string) => {
    const selectedAccountPayments = data?.payments.filter(payment => payment.accountId === accountId) || [];

    if (selectedPayments.includes(accountId)) {
      setSelectedPayments((prev) => prev.filter(id => id !== accountId));
      const deselectedAmount = selectedAccountPayments.reduce((sum, payment) => sum + payment.amount, 0);
      setTotalSelectedAmount((prev) => prev - deselectedAmount);
    } else {
      setSelectedPayments((prev) => [...prev, accountId]);
      const selectedAmount = selectedAccountPayments.reduce((sum, payment) => sum + payment.amount, 0);
      setTotalSelectedAmount((prev) => prev + selectedAmount);
    }
  };

  if (error) return <div className={styles.error}>Failed to load</div>;
  if (!data) return <div className={styles.loading}>Loading...</div>;

  const { payments, totalPayments } = data;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Listado de Pagos Pendientes</h1>
        <button className={styles.logoutButton} onClick={handleLogout}>Cerrar sesión</button>
      </header>

      <h1 className={styles.pageTitle}>Pagos Pendientes</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th></th>
            <th>ID de Cuenta</th>
            <th>Referencia</th>
            <th>Monto</th>
            <th>Moneda</th>
            <th>Método de Pago</th>
            <th>Estado del Pago</th>
            <th>Fecha de Creación</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className={styles.row}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedPayments.includes(payment.accountId)}
                  onChange={() => handleCheckboxChange(payment.accountId)}
                />
              </td>
              <td>{payment.accountId}</td>
              <td>{payment.reference}</td>
              <td>{payment.amount}</td>
              <td>{payment.currency}</td>
              <td>{payment.paymentGateway}</td>
              <td>{payment.status}</td>
              <td>{formatDate(payment.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className={styles.paginationButton}
        >
          Anterior
        </button>
        <span className={styles.pageInfo}>Página {page} de {Math.ceil(totalPayments / limit)}</span>
        <button
          onClick={handleNextPage}
          disabled={page >= Math.ceil(totalPayments / limit)}
          className={styles.paginationButton}
        >
          Siguiente
        </button>
      </div>

      <div className={styles.totalAmount}>
        <h2>Total seleccionado: {totalSelectedAmount}</h2>
      </div>
    </div>
  );
});
