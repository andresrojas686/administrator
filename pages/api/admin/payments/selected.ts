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
    //pago update ok
    console.log('Estado del pago actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar el estado del pago:', error);
  }
};

/*
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
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscriptionBody)
  });

  if (!response.ok) {
    throw new Error('Error al crear la suscripción');
  }

  const data = await response.json();
  return data;
};
*/

// Handler principal
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { accountId, references, payments, totalAmount, paymentAvailableAmounts } = req.body;

    console.log('Datos recibidos en selected.ts:', { accountId, references, payments, totalAmount, paymentAvailableAmounts });

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
      } else {
        console.log('Plan seleccionado Correctamente');
        // console.log('Plan seleccionado:', selectedPlan);
      }

      // el totalAmount es la suma de los pagos
      let remainingBalance = totalAmount||0;
      // console.log('remainingBalance', remainingBalance); 
      // let remainingBalance = selectedPlan.prices[0].price || 0;
      console.log('remainingBalance inicial:', remainingBalance);
      console.log('Valor del plan seleccionado:', selectedPlan.prices[0].price || 0);

    
      for (let i = 0; i < payments.length; i++) {
        const payment = payments[i];
        let usedAmount = 0;
        let paymentStatus = '';

        console.log('payment  -->', payment);

        // Validamos que payment.amount sea un número y no undefined
        if (typeof payment.amount !== 'number' || isNaN(payment.amount)) {
          console.error('El monto del pago no es válido:', payment.amount);
          continue; // Saltamos a la siguiente iteración si el monto es inválido
        }


        if (remainingBalance >= payment.amount) {
          usedAmount = payment.amount;
          paymentStatus = 'Applied';
        } else {
          if (i === payments.length - 1) {
            usedAmount = remainingBalance;
            paymentStatus = 'partiallyApplied';
          } else {
            usedAmount = payment.amount;
            paymentStatus = 'Applied';
          }

        }
        console.log('payment id db', payment);
        console.log('usedAmount', usedAmount);
        console.log('paymentStatus', paymentStatus);

        console.log(`Pago #${i} -> UsedAmount: ${usedAmount}, Status: ${paymentStatus}`);

        // Validamos que el usedAmount sea válido
        if (typeof usedAmount !== 'number' || isNaN(usedAmount) || usedAmount <= 0) {
          console.error('Error: usedAmount no es válido:', usedAmount);
          continue; // Saltamos este pago si usedAmount es inválido
        }

        console.log('Antes de actualizar pagos');
        await updatePaymentStatus(payment, usedAmount, paymentStatus);

        remainingBalance -= usedAmount;
        console.log('remainingBalance después de actualizar el pago:', remainingBalance);

        if (remainingBalance <= 0) {
          console.log('entra en remainingBalance <= usedAmount');
          break;
        }
      }

      // return;//return para que no se cree la suscripción
      /*

      // Ahora que los pagos han sido actualizados, creamos la suscripción
      await createSubscription(accountId, selectedPlan.name, references);

      // Redireccionar a la página de suscripciones con un mensaje de éxito
      res.setHeader('Set-Cookie', [
        serialize('message', 'Subscription created successfully!', { path: '/' }),
      ]);

      res.redirect(302, '/suscriptions');
      */
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Error al crear la suscripción' });
    }


    // } else {
    //   res.setHeader('Allow', ['POST']);
    //   res.status(405).end(`Method ${req.method} Not Allowed`);
    // }

  }
}

