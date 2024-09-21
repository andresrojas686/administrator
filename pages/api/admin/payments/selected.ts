import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { accountId, references, totalAmount } = req.body;

    try {
      // Validar los datos recibidos
      if (!accountId || !references || !totalAmount) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
      }

      console.log('Datos recibidos:', { accountId, references, totalAmount });

      // Aquí puedes añadir lógica para procesar estos datos (e.g., consulta de planes, creación de suscripción)

      // Respuesta exitosa
      return res.status(200).json({ message: 'Datos recibidos correctamente' });
    } catch (error) {
      console.error('Error procesando la solicitud:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    // Si el método HTTP no es POST, retornamos un error
    return res.status(405).json({ error: 'Método no permitido' });
  }
}
