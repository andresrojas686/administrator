import { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { documentId, status } = req.body;

    if (!documentId || !status) {
        return res.status(400).json({ message: 'Faltan datos en la solicitud' });
    }

    try {
        await client.connect();
        const db = client.db('estilistas_go');

        const result = await db.collection('stylistdocumentmoderations').updateOne(
            { _id: new ObjectId(documentId) },
            { $set: { documentStatus: status } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Documento no encontrado o no actualizado' });
        }

        return res.status(200).json({ message: 'Estado del documento actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando documento:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        await client.close();
    }
}
