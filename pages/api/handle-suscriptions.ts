import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie'; // Para manejar cookies

const PLANS_URL = process.env.PLANS_URL || '';
const PLANS_COUNTRY = process.env.PLANS_COUNTRY || '';
const PLAN_CONCURRENCY = process.env.PLAN_CONCURRENCY || '';

interface Price {
  currency: string;
  price: number;
  startDate: string;
  endDate: string;
}

interface Plan {
  id: string;
  name: string;
  country: string;
  prices: Price[];
  status: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { accountId, references, totalAmount } = req.body;

    console.log('Datos recibidos:', { accountId, references, totalAmount });

    try {
      const urlWithParams = `${PLANS_URL}?country=${PLANS_COUNTRY}&currency=${PLAN_CONCURRENCY}`;
      const response = await fetch(urlWithParams);

      if (!response.ok) {
        throw new Error('Error al consultar los planes');
      }

      const plans: Plan[] = await response.json();
      const activePlans = plans.filter(plan => plan.status === 'active');
      const selectedPlan = activePlans.find(plan => {
        return plan.prices.some(price => price.price <= totalAmount);
      });

      if (!selectedPlan) {
        console.log('No hay planes disponibles que se ajusten al total de pagos.');
        return res.status(400).json({ error: 'No hay planes disponibles que se ajusten al total de pagos.' });
      }

      console.log('Plan seleccionado:', selectedPlan);

      // Guardar los datos en cookies
      res.setHeader('Set-Cookie', [
        serialize('accountId', accountId, { path: '/' }),
        serialize('references', JSON.stringify(references), { path: '/' }),
        serialize('totalAmount', totalAmount.toString(), { path: '/' }),
        serialize('selectedPlan', JSON.stringify(selectedPlan), { path: '/' }),
        serialize('plans', JSON.stringify(activePlans), { path: '/' })
      ]);

      // Redirigir a la página de suscripciones
      res.redirect(302, '/suscriptions');
      
    } catch (error) {
      console.error('Error al consultar los planes:', error);
      return res.status(500).json({ error: 'Error al consultar los planes' });
    }
    
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
