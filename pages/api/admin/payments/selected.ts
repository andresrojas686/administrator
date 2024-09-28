import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

// Obtenemos la URL del servicio de planes desde las variables de entorno
const PLANS_URL = process.env.PLANS_URL || '';
const PLANS_COUNTRY = process.env.PLANS_COUNTRY || '';
const PLAN_CONCURRENCY = process.env.PLAN_CONCURRENCY || '';

// Definimos la estructura esperada de los precios dentro de cada plan
interface Price {
  currency: string;
  price: number;
  startDate: string;
  endDate: string;
}

// Definimos la estructura del plan
interface Plan {
  id: string;
  name: string;
  country: string;
  prices: Price[];
  status: string;
}

// Función para actualizar el estado de los pagos
const updatePaymentStatus = async (paymentId: string, status: string, balance?: number) => {
  try {
    // Suponemos que tienes un endpoint para actualizar pagos
    const updatePaymentURL = `http://127.0.0.1:3001/admin/api/payments/${paymentId}`;
    const response = await fetch(updatePaymentURL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, balance })
    });
    console.log("El programa se detendrá ahora.");
    process.exit(0);  

    if (!response.ok) {
      throw new Error('Error al actualizar el estado del pago');
    }
  } catch (error) {
    console.error('Error al actualizar el estado del pago:', error);
  }
};

// Función para crear la suscripción
const createSubscription = async (accountId: string, plan: string, paymentReferences: string[]) => {
  const createSubscriptionURL = `http://127.0.0.1:3001/admin/api/subscriptions/${accountId}`;

  const subscriptionBody = {
    plan: "monthly",   // El plan se puede ajustar según tu lógica
    duration: 6,       // Duración del plan
    durationType: "month",
    countryCode: PLANS_COUNTRY,
    paymentReferences
  };

  const response = await fetch(createSubscriptionURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscriptionBody)
  });

  if (!response.ok) {
    throw new Error('Error al crear la suscripción');
  }

  const data = await response.json();
  return data;
};

// Handler principal
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { accountId, references, payments, totalAmount } = req.body;

    console.log('Datos recibidos:', { accountId, references, payments, totalAmount });

    try {
      // Construir la URL con los parámetros para obtener los planes
      const urlWithParams = `${PLANS_URL}?country=${PLANS_COUNTRY}&currency=${PLAN_CONCURRENCY}`;
      const response = await fetch(urlWithParams);

      if (!response.ok) {
        throw new Error('Error al consultar los planes');
      }

      const plans: Plan[] = await response.json();
      const activePlans = plans.filter(plan => plan.status === 'active');

      // Seleccionar el plan adecuado según el totalAmount
      const selectedPlan = activePlans.find(plan => {
        return plan.prices.some(price => price.price <= totalAmount);
      });

      if (!selectedPlan) {
        console.log('No hay planes disponibles que se ajusten al total de pagos.');
        return res.status(400).json({ error: 'No hay planes disponibles que se ajusten al total de pagos.' });
      }

      // Crear la suscripción con el plan seleccionado
      await createSubscription(accountId, selectedPlan.name, references);

      // Actualizar el estado de los pagos seleccionados
      let remainingBalance = totalAmount;
      for (const payment of references) {
        if (remainingBalance > 0) {
          // Actualizar el estado a "Applied" o "Partially Applied" según el saldo restante
          const paymentStatus = remainingBalance >= totalAmount ? 'Applied' : 'Partially Applied';
          await updatePaymentStatus(payment, paymentStatus, remainingBalance);
          remainingBalance -= totalAmount;  // Ajustar el saldo restante
        }
      }

      // Redireccionar a la página de suscripciones con un mensaje de éxito
      res.setHeader('Set-Cookie', [
        serialize('message', 'Subscription created successfully!', { path: '/' }),
      ]);

      res.redirect(302, '/suscriptions');

    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Error al crear la suscripción' });
    }

  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
