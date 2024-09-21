import { NextApiRequest, NextApiResponse } from 'next';

// Obtenemos la URL del servicio de planes desde las variables de entorno
const PLANS_URL = process.env.PLANS_URL;

console.log('URL de planes:', PLANS_URL);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { accountId, references, totalAmount } = req.body;

    console.log('Datos recibidos:', { accountId, references, totalAmount });

    try {
        // Usar PLANS_URL correctamente
        const response = await fetch(PLANS_URL);
        if (!response.ok) {
          throw new Error('Error al consultar los planes');
        }
        const plans = await response.json();
        console.log('Planes disponibles:', plans);
        
        // Aquí sigue la lógica para seleccionar un plan adecuado
        const selectedPlan = plans.find(plan => {
          const price = plan.prices[0]?.amount; // Ajusta según necesites
          return price && price <= totalAmount; // Lógica para seleccionar el plan
        });

        if (!selectedPlan) {
          return res.status(400).json({ error: 'No hay planes disponibles que se ajusten al total de pagos.' });
        }

        // Aquí puedes proceder a crear la suscripción usando selectedPlan

        return res.status(200).json({ message: 'Datos recibidos correctamente', selectedPlan });
        
    } catch (error) {
      console.error('Error al consultar los planes:', error);
      res.status(500).json({ error: 'Error al consultar los planes' });
    }
    
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
