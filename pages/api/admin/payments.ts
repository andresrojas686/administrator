import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page = 1, limit = 20, id, order = 'desc' } = req.query; // Añadir parámetro "order"

  try {
    let url;
    if (id) {
      // Si se proporciona un ID, buscamos un pago específico
      url = `${process.env.PAYMENTS_URL}/${id}`;
    } else {
      // Si no se proporciona un ID, obtenemos los pagos pendientes
      // url = `${process.env.PAYMENTS_URL}?page=${page}&limit=${limit}&order=${order}&sort=createdAt`; // Ordenar por createdAt
      // const status = "'pending, partially applied'"; // Filtramos por estatus 'pending' y 'partially applied'
      url = `${process.env.PAYMENTS_URL}?status=pending&status=partiallyApplied&page=${page}&limit=${limit}&order=${order}&sort=createdAt`; // Ordenar por createdAt
    console.log(url);
    }

    // Realizamos la petición a la API de pagos
    const response = await fetch(url);
    const data = await response.json();

    // Enviamos la respuesta al cliente
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Error fetching payments' });
  }
}
