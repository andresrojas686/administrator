import { NextApiRequest, NextApiResponse } from 'next';

// Obtenemos la URL del servicio de planes desde las variables de entorno
const PLANS_URL = process.env.PLANS_URL || '';
const PLANS_COUNTRY = process.env.PLANS_COUNTRY || '';
const PLAN_CONCURRENCY = process.env.PLAN_CONCURRENCY || '';

console.log('URL de planes:', PLANS_URL);

// Definimos la estructura esperada de los precios dentro de cada plan
interface Price {
  currency: string;
  price: number;
  startDate: string;
  endDate: string;
}

// Definimos la estructura del plan según lo que mencionaste
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
      // Construir la URL con los parámetros
      const urlWithParams = `${PLANS_URL}?country=${PLANS_COUNTRY}&currency=${PLAN_CONCURRENCY}`;
      console.log('URL completa para consultar los planes:', urlWithParams);

      const response = await fetch(urlWithParams);
      if (!response.ok) {
        throw new Error('Error al consultar los planes');
      }
      const plans: Plan[] = await response.json();    
      // Filtrar los planes que estén activos (status: 'active')
      const activePlans = plans.filter(plan => plan.status === 'active');
      console.log('Planes activos disponibles:', JSON.stringify(activePlans, null, 2));

      // Lógica para seleccionar el plan adecuado
      const selectedPlan = activePlans.find(plan => {
        return plan.prices.some(price => price.price <= totalAmount); // Verificar si hay algún precio que se ajuste
      });

      if (!selectedPlan) {
        return res.status(400).json({ error: 'No hay planes disponibles que se ajusten al total de pagos.' });
      }

      // Aquí puedes proceder a crear la suscripción usando selectedPlan
      console.log('Plan seleccionado:', selectedPlan);

      // Respuesta exitosa con el plan seleccionado
      return res.status(200).json({ message: 'Plan seleccionado correctamente', selectedPlan });
      
    } catch (error) {
      console.error('Error al consultar los planes:', error);
      return res.status(500).json({ error: 'Error al consultar los planes' });
    }
    
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
