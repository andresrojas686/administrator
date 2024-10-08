import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
// import { redirect } from 'next/dist/server/api-utils';
// import { redirect } from'next/navigation';

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
  durationType: string;
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

//creamos la suscripcion
const createSubscription = async (accountId: string, planName: string, durationType: string, paymentReferences: string[]) => {
  try {
    // Construimos la URL del servicio para crear la suscripción
    const subscriptionURL = `http://127.0.0.1:3001/admin/accounts/${accountId}/subscription`;

    // Definimos el cuerpo de la solicitud
    const requestBody = {
      plan: planName,
      duration: 1, // Puedes ajustar esto según el valor real de duración
      durationType: durationType,
      countryCode: 'VEN', // Puedes ajustar el código de país si es necesario
      paymentReferences: paymentReferences
    };

    // console.log('-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*');
    console.log('-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*');
    console.log('-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*');
    console.log('Enviando solicitud para crear suscripción:', requestBody);
    console.log('-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*');
    console.log('-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*');
    // console.log('-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*');

    // Realizamos la solicitud PUT al servicio
    const response = await fetch(subscriptionURL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Error al crear la suscripción: ${errorDetails}`);
    } else {
      // Suscripción creada exitosamente
      console.log('Suscripción creada correctamente??? ver coleccionDB');
      // Enviamos la respuesta al frontend
      // redirect('/suscripción-exitosa');
      return 'Suscripción creada exitosamente';
      
    }



    // Guardar en localStorage para notificar a pending-payments.tsx
    localStorage.setItem('subscriptionSuccess', 'true');
  } catch (error) {
    console.error('Error al crear la suscripción:', error);
    
  }
};

// Handler principal
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { accountId, references, payments, totalAmount, paymentAvailableAmounts } = req.body;

    console.log('Datos recibidos en selected.ts:', { accountId, references, payments, totalAmount, paymentAvailableAmounts });

    try {
      // Consultamos los planes disponibles
      const urlWithParams = `${PLANS_URL}?country=${PLANS_COUNTRY}&currency=${PLAN_CONCURRENCY}`;
      const response = await fetch(urlWithParams);

      if (!response.ok) {
        throw new Error('Error al consultar los planes');
      }

      const plans: Plan[] = await response.json();
      // Filtramos los planes activos y cuyo "DurationType" no sea null ni undefined
      const activePlans = plans.filter(plan => {
        return plan.status === 'active' && plan.durationType !== null && plan.durationType !== undefined;
      });
      //const activePlans = plans.filter(plan => plan.status === 'active');

      // Seleccionar el plan adecuado según el totalAmount
      const selectedPlan = activePlans.find(plan => {
        return plan.prices.some(price => price.price <= totalAmount);
      });

      if (!selectedPlan) {
        console.log('No hay planes disponibles que se ajusten al total de pagos.');
        return res.status(400).json({ error: 'No hay planes disponibles que se ajusten al total de pagos.' });
      } else {
        console.log('Plan seleccionado Correctamente');
        console.log('Plan seleccionado:', selectedPlan);
      }

      // Total amount inicial que representa el valor del plan
      let remainingBalance = selectedPlan.prices[0].price || 0;
      console.log('Total Pagos inicial:', remainingBalance);

      // Array para almacenar las referencias de pago utilizadas
      const usedReferences: string[] = [];

      // Iteramos sobre los pagos
      for (let i = 0; i < payments.length; i++) {
        const paymentId = payments[i];
        const availableAmount = paymentAvailableAmounts[i]; // El monto disponible de cada pago
        const paymentReference = references[i];

        console.log(`Procesando pago ${i}:`, { paymentId, availableAmount });

        let usedAmount = 0;
        let paymentStatus = '';

        if (remainingBalance >= availableAmount) {
          usedAmount = availableAmount;
          paymentStatus = 'Applied';
        } else {
          usedAmount = remainingBalance; // Usamos lo que queda para cubrir el plan
          paymentStatus = 'partiallyApplied';
        }

        console.log(`Pago #${i} -> UsedAmount: ${usedAmount}, Status: ${paymentStatus}`);

        // Actualizar el estado del pago
        await updatePaymentStatus(paymentId, usedAmount, paymentStatus);

        remainingBalance -= usedAmount; // Descontamos el monto usado
        console.log('Remaining balance después de actualizar el pago:', remainingBalance);
        usedReferences.push(paymentReference);

        if (remainingBalance <= 0) {
          console.log('El plan ha sido completamente cubierto con los pagos.');
          break; // Terminamos una vez que el plan ha sido cubierto
        }
      }

      // Comentamos la creación de la suscripción
      await createSubscription(accountId, selectedPlan.name, selectedPlan.durationType, usedReferences);

      return res.status(200).json({ message: 'Suscripción creada correctamente???' });

    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Error al crear la suscripción' });
    }
  }
}
