// pages/admin/pending-payments.tsx
import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Payment {
  id: string;
  accountId: string;
  reference: string;
  amount: number;
  currency: string;
  paymentGateway: string;
  status: string;
  createdAt: string;
}

interface PaymentsResponse {
  payments: Payment[];
  totalPayments: number;
}

export default function PendingPayments() {
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, error } = useSWR<PaymentsResponse>(`/api/admin/payments?page=${page}&limit=${limit}`, fetcher);

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => p + 1);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const { payments, totalPayments } = data;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pagos Pendientes</h1>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">ID de Cuenta</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Monto</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Moneda</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Fecha de Creación</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{payment.accountId}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{payment.reference}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{payment.amount}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{payment.currency}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{payment.status}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{payment.paymentGateway}</td>
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
    </div>
  );
}