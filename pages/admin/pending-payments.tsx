import { useEffect, useState } from 'react';
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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Estado para controlar el popup
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

      // Restamos el valor disponible del pago deseleccionado
      const deselectedAmount = accountPayments.find(payment => payment.id === paymentId)
        ? accountPayments.find(payment => payment.id === paymentId)!.amount - accountPayments.find(payment => payment.id === paymentId)!.usedAmount
        : 0;

      setTotalSelectedAmount(prev => prev - deselectedAmount);

      if (selectedPayments.length === 1) {
        setDisabledAccounts([]);
      }
    } else {
      const firstAccountSelected = selectedPayments.length === 0;

      if (firstAccountSelected || disabledAccounts.includes(accountId)) {
        const newSelectedPayments = [
          ...selectedPayments,
          ...accountPayments.filter(payment => !selectedPayments.includes(payment.id)).map(payment => payment.id)
        ];
        // Sumamos el monto disponible (amount - usedAmount)
        const totalAmount = accountPayments.reduce((sum, payment) =>
          selectedPayments.includes(payment.id)
            ? sum
            : sum + (payment.amount - payment.usedAmount), 0);
        setSelectedPayments(newSelectedPayments);
        setTotalSelectedAmount(prev => prev + totalAmount);

        setDisabledAccounts([accountId]);
      }
    }
  };

  const [disabledAccounts, setDisabledAccounts] = useState<string[]>([]);


  const handleSubmit = async () => {
    if (selectedPayments.length === 0) return; // Asegurarse de que haya pagos seleccionados

    const selectedPaymentDetails = data?.payments.filter(payment => selectedPayments.includes(payment.id)) || [];
    const paymentReferences = selectedPaymentDetails.map(payment => payment.reference);
    const paymentIds = selectedPaymentDetails.map(payment => payment.id);
    const accountIds = selectedPaymentDetails.map(payment => payment.accountId);
    const paymentAvailableAmounts = selectedPaymentDetails.map(payment => payment.amount - payment.usedAmount); // Montos disponibles
    const totalAmount = totalSelectedAmount;


    try {
      const response = await fetch('/api/admin/payments/selected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: accountIds[0], // Enviamos solo el primer ID de cuenta
          references: paymentReferences,
          payments: paymentIds,
          paymentAvailableAmounts: paymentAvailableAmounts,
          totalAmount: totalAmount,
        }),
      });

      // console.log("El programa se detendrá ahora.");
      // process.exit(0);

      if (!response.ok) {
        // Manejar el error
        console.error('Error al enviar los datos');
      }
      else {
        console.log('se aplican pagos y se crea suscripcion correctamente');
        //aqui puedo mostrar un popup de mensaje exitoso y hacer un reload page.
        setShowSuccessPopup(true);
      }

    } catch (error) {
      console.error('Error en handleSubmit:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const closePopupAndReload = () => {
    setShowSuccessPopup(false);
    window.location.reload(); // Recargar la página después de cerrar el popup
  };

  if (error) return <div className={styles.error}>Failed to load</div>;
  if (!data) return <div className={styles.loading}>Loading...</div>;

  const { payments, totalPayments } = data;

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

      <button onClick={handleSubmit} className={styles.submitButton} disabled={selectedPayments.length === 0}>
        Agregar Suscripcion
      </button>
      {/* Popup de éxito */}
      {showSuccessPopup && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h2>¡Pagos aplicados con éxito!</h2>
            <p>Los pagos seleccionados se han aplicado correctamente y se ha creado una suscripción.</p>
            <button onClick={closePopupAndReload} className={styles.popupButton}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
});