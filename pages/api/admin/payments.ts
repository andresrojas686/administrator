// pages/api/admin/payments.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page = 1, limit = 15 } = req.query;

  try {
    const response = await fetch(`http://localhost:3000/api/admin/payments?status=pending&page=${page}&limit=${limit}&order=desc`);
    const data = await response.json();
    
    //console.log(data);
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Error fetching payments' });
  }
}