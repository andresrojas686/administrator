import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from "../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { documentId, newStatus } = req.body;

      const client = await clientPromise;
      const db = client.db("estilistas_go");

      const result = await db.collection('stylistdocumentmoderations').updateOne(
        { _id: documentId },
        { $set: { documentStatus: newStatus } }
      );

      if (result.modifiedCount === 1) {
        res.status(200).json({ message: 'Documento actualizado con éxito' });
      } else {
        res.status(404).json({ message: 'Documento no encontrado' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}