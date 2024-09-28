import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import withAuth from '../components/withAuth';

const SuscriptionsPage = () => {
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const accountId = Cookies.get('accountId');
    const references = JSON.parse(Cookies.get('references') || '[]');
    const totalAmount = Cookies.get('totalAmount');
    const selectedPlan = JSON.parse(Cookies.get('selectedPlan') || '{}');
    const plans = JSON.parse(Cookies.get('plans') || '[]');
    const successMessage = Cookies.get('message');

    console.log('Datos recibidos en suscriptions:', { accountId, references, totalAmount, selectedPlan, plans });

    setData({
      accountId,
      references,
      totalAmount,
      selectedPlan,
      plans
    });

    if (successMessage) {
      setMessage(successMessage);
      Cookies.remove('message'); // Limpiar el mensaje después de mostrarlo
    }
  }, []);

  return (
    <div>
      <h1>Suscripciones</h1>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <p><strong>Cuenta ID:</strong> {data?.accountId}</p>
      <p><strong>Referencias de Pagos:</strong> {JSON.stringify(data?.references)}</p>
      <p><strong>Total de pagos:</strong> {data?.totalAmount}</p>
      <p><strong>Plan seleccionado:</strong> {data?.selectedPlan?.name}</p>
    </div>
  );
};

export default withAuth(SuscriptionsPage);
