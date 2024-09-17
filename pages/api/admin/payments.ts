// pages/api/admin/payments.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page = 1, limit = 15, id } = req.query;

  try {
    let url;
    if (id) {
      // Si se proporciona un ID, obtenemos los detalles de ese pago específico
      //url = `http://localhost:3000/api/admin/payments/${id}`;
      url = `${process.env.PAYMENTS_URL}/${id}`;
    } else {
      // Si no, obtenemos la lista de pagos pendientes
    //   url = `http://localhost:3000/api/admin/payments?status=pending&page=${page}&limit=${limit}&order=desc`;
    url = `${process.env.PAYMENTS_URL}?status=pending&page=${page}&limit=${limit}&order=desc`;
    }

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Error fetching payments' });
  }
}