import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page = 1, limit = 20, id, order = 'desc' } = req.query; // Añadir parámetro "order"

  try {
    let url;
    if (id) {
      url = `${process.env.PAYMENTS_URL}/${id}`;
    } else {
      url = `${process.env.PAYMENTS_URL}?status=pending&page=${page}&limit=${limit}&order=desc&sort=createdAt`; // Ordenar por createdAt
    }

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Error fetching payments' });
  }
}
