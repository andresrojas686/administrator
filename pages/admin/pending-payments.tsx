// pages/admin/pending-payments.tsx
import { useState } from 'react';
import useSWR from 'swr';
import withAuth from '../../components/withAuth';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import styles from '../styles/estilistas.module.css';

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
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 15;

  const { data, error } = useSWR<PaymentsResponse>(`/api/admin/payments?page=${page}&limit=${limit}`, fetcher);

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => p + 1);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const openPaymentDetail = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const closePaymentDetail = () => {
    setSelectedPayment(null);
    setIsModalOpen(false);
  };

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const { payments, totalPayments } = data;

  const handleLogout = () => {
    logout();
    router.push('/');
};

  return (
    <div className="container mx-auto p-4">
      <header className={styles.header}>
                    <h1 className={styles.title}>Listado de Estilistas y Documentos</h1>
                    <button className={styles.logoutButton} onClick={handleLogout}>Cerrar sesión</button>
                </header>
      <h1 className="text-2xl font-bold mb-4">Pagos Pendientes</h1>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">ID de Cuenta</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Monto</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Moneda</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Estado del Pago</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Fecha de Creación</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} onClick={() => openPaymentDetail(payment)} className="cursor-pointer hover:bg-gray-100">
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{payment.accountId}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{payment.reference}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{payment.amount}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{payment.currency}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{payment.paymentGateway}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{payment.status}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{formatDate(payment.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between items-center">
        <button 
          onClick={handlePrevPage} 
          disabled={page === 1}
          className="px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition ease-in-out duration-150"
        >
          Anterior
        </button>
        <span>Página {page} de {Math.ceil(totalPayments / limit)}</span>
        <button 
          onClick={handleNextPage} 
          disabled={page >= Math.ceil(totalPayments / limit)}
          className="px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition ease-in-out duration-150"
        >
          Siguiente
        </button>
      </div>

      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={closePaymentDetail}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Detalle del Pago</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">ID: {selectedPayment.id}</p>
                <p className="text-sm text-gray-500">Cuenta: {selectedPayment.accountId}</p>
                <p className="text-sm text-gray-500">Referencia: {selectedPayment.reference}</p>
                <p className="text-sm text-gray-500">Monto: {selectedPayment.amount} {selectedPayment.currency}</p>
                <p className="text-sm text-gray-500">Monto Usado: {selectedPayment.usedAmount} {selectedPayment.currency}</p>
                <p className="text-sm text-gray-500">Estado: {selectedPayment.status}</p>
                <p className="text-sm text-gray-500">País: {selectedPayment.countryCodeGateway}</p>
                <p className="text-sm text-gray-500">Método de Pago: {selectedPayment.paymentGateway}</p>
                <p className="text-sm text-gray-500">Número de Referencia: {selectedPayment.paymentGatewayData.referenceNumber}</p>
                <p className="text-sm text-gray-500">Número de Teléfono: {selectedPayment.paymentGatewayData.phoneNumber}</p>
                <p className="text-sm text-gray-500">Creado: {formatDate(selectedPayment.createdAt)}</p>
                <p className="text-sm text-gray-500">Actualizado: {formatDate(selectedPayment.updatedAt)}</p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={closePaymentDetail}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
})