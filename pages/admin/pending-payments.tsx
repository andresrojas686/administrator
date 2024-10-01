import { useState } from 'react';
import useSWR from 'swr';
import withAuth from '../../components/withAuth';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import styles from '../styles/PendingPayments.module.css';
import Link from 'next/link';

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

  const { data, error } = useSWR<PaymentsResponse>(`/api/admin/payments?page=${page}&limit=${limit}&order=desc`, fetcher);

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => p + 1);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };


  const handleCheckboxChange = (paymentId: string, accountId: string) => {
    const accountPayments = data?.payments.filter(payment => payment.accountId === accountId) || [];

    if (selectedPayments.includes(paymentId)) {
      // Deseleccionar solo el pago clicado
      setSelectedPayments(prev => prev.filter(id => id !== paymentId));
      const deselectedAmount = accountPayments.find(payment => payment.id === paymentId)?.amount || 0;
      setTotalSelectedAmount(prev => prev - deselectedAmount);

      // Si todos los pagos de la cuenta fueron deseleccionados, habilitamos otros pagos
      if (selectedPayments.length === 1) {
        setDisabledAccounts([]);
      }
      //console.log('Pagos seleccionados después del cambio:', selectedPayments);
    } else {
      // Si no se ha seleccionado ningún pago de otra cuenta
      const firstAccountSelected = selectedPayments.length === 0;

      if (firstAccountSelected || disabledAccounts.includes(accountId)) {
        const newSelectedPayments = [
          ...selectedPayments,
          ...accountPayments.filter(payment => !selectedPayments.includes(payment.id)).map(payment => payment.id)
        ];
        const totalAmount = accountPayments.reduce((sum, payment) =>
          selectedPayments.includes(payment.id) ? sum : sum + payment.amount, 0);
        setSelectedPayments(newSelectedPayments);
        setTotalSelectedAmount(prev => prev + totalAmount);

        // Deshabilitar pagos de otras cuentas
        setDisabledAccounts([accountId]);
      }
    }
  };

  const [disabledAccounts, setDisabledAccounts] = useState<string[]>([]);


  const handleSubmit = async () => {
    if (selectedPayments.length === 0) return; // Asegurarse de que haya pagos seleccionados

    //const selectedPaymentDetails = data?.payments.filter(payment => selectedPayments.includes(payment.accountId)) || [];

    const selectedPaymentDetails = data?.payments.filter(payment => selectedPayments.includes(payment.id)) || [];
    const paymentReferences = selectedPaymentDetails.map(payment => payment.reference);
    const paymentIds = selectedPaymentDetails.map(payment => payment.id);
    const accountIds = selectedPaymentDetails.map(payment => payment.accountId);
    const totalAmount = totalSelectedAmount;

    console.log('Datos enviados para la suscripción:', {
      accountId: accountIds[0], // Enviamos solo el primer ID de cuenta
      references: paymentReferences,
      payments: paymentIds,
      totalAmount: totalAmount,
    });
    // debugger;
    const response = await fetch('/api/admin/payments/selected', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: accountIds[0], // Enviamos solo el primer ID de cuenta
        references: paymentReferences,
        payments: paymentIds,
        totalAmount: totalAmount,
      }),
    });

    // console.log("El programa se detendrá ahora.");
    // process.exit(0);

    if (response.ok) {
      // Manejar la respuesta en caso de éxito
      const result = await response.json();
      console.log('Suscripción creada con éxito:', result);
      //router.push('/subscriptions'); // Redireccionar a la página de suscripciones
    } else {
      // Manejar el error
      console.error('Error al crear la suscripción');
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
        <Link href="/dashboard">
          <button className={styles.loginButton} >Dashboard</button>
        </Link>
        <button className={styles.logoutButton} onClick={handleLogout}>Cerrar sesión</button>
      </header>

      <h1 className={styles.pageTitle}>Pagos Pendientes</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th></th>
            <th>ID de Cuenta</th>
            <th>Referencia</th>
            <th>IDBD</th>
            <th>Monto</th>
            <th>Moneda</th>
            <th>Método de Pago</th>
            <th>Estado del Pago</th>
            <th>Fecha de Creación</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((payment) => {
            // Calculamos el valor disponible antes del retorno del JSX
            const disponible = payment.amount >= payment.usedAmount
              ? payment.amount - payment.usedAmount
              : payment.amount;

            // Si el valor disponible es menor o igual a 0, no mostramos la fila
            if (disponible <= 0) {
              return null; // No se renderiza esta fila
            }

            return (
              <tr key={payment.id} className={styles.row}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedPayments.includes(payment.id)} // Verificamos si el pago está seleccionado
                    onChange={() => handleCheckboxChange(payment.id, payment.accountId)} // Pasamos el payment.id y el accountId
                    disabled={disabledAccounts.length > 0 && !disabledAccounts.includes(payment.accountId)} // Deshabilitamos pagos de otras cuentas
                  />
                </td>
                <td>{payment.accountId}</td>
                <td>{payment.reference}</td>
                <td>{payment.id}</td>
                <td>{disponible}</td> {/* Mostramos el valor disponible */}
                <td>{payment.currency}</td>
                <td>{payment.paymentGateway}</td>
                <td>{payment.status}</td>
                <td>{formatDate(payment.createdAt)}</td>
              </tr>
            );
          })}
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

      <button onClick={handleSubmit} className={styles.submitButton}>
        Enviar Pagos Seleccionados
      </button>
    </div>
  );
});
