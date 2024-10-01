import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

// Obtenemos la URL del servicio de planes desde las variables de entorno
const PLANS_URL = process.env.PLANS_URL || '';
const PLANS_COUNTRY = process.env.PLANS_COUNTRY || '';
const PLAN_CONCURRENCY = process.env.PLAN_CONCURRENCY || '';
const PAYMENTS_URL = process.env.PAYMENTS_URL || ''; // URL para actualizar los pagos

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
const updatePaymentStatus = async (paymentId: string, usedAmount: number, status: string) => {
  try {
    // Usamos la URL de pagos desde la variable de entorno
    const updatePaymentURL = `${PAYMENTS_URL}/${paymentId}`;

    console.log("la url de actualizacion es ", updatePaymentURL);

    // Detenemos la ejecución aquí con un console.log y devolvemos la información
    console.log("Actualizando el estado del pago con los siguientes datos:");
    console.log({
      paymentId,
      usedAmount,
      status
    });

    const response = await fetch(updatePaymentURL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usedAmount, status }),
      
    });
    console.log('--##-- body --##--', JSON.stringify({ usedAmount, status }));

    if (!response.ok) {
      const errorDetails = await response.text(); // Capturamos los detalles de la respuesta
      throw new Error(`+++##+++ Error al actualizar el estado del pago: ${errorDetails}`);
    }
    console.log('Estado del pago actualizado correctamente');
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

  console.log("Creando la suscripción con los siguientes datos:");
  console.log(subscriptionBody);
  return;

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

      console.log('Plan seleccionado:', selectedPlan);

      // Actualizar el estado de los pagos seleccionados antes de crear la suscripción
      let remainingBalance = totalAmount;
      console.log('remainingBalance', remainingBalance); 

      for (const payment of payments) {
        if (remainingBalance > 0) {
          // Actualizamos el pago con el balance utilizado y el estado correspondiente
          //const usedAmount = remainingBalance >= payment.amount ? payment.amount : remainingBalance;
          const usedAmount = selectedPlan.prices[0].price;
          const paymentStatus = remainingBalance >= payment.amount ? 'Applied' : 'partiallyApplied';

          console.log('payments', payment);
          console.log('usedAmount', usedAmount);
          console.log('paymentStatus', paymentStatus);

          // Actualizamos el pago con la información correcta
          await updatePaymentStatus(payment, usedAmount, paymentStatus);

          //el remainingBalance quedaria con el saldo a favor, pero en este punto es inutil
          remainingBalance -= usedAmount; // informativo
          console.log('remainingBalance 2', remainingBalance); 
        }
      }

      // Ahora que los pagos han sido actualizados, creamos la suscripción
      await createSubscription(accountId, selectedPlan.name, references);

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
