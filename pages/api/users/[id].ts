import type { NextApiRequest, NextApiResponse } from 'next';
import initFirebase from '../../../lib/firebase';
import { User } from '../../../models/user';

type Error = {
    message: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<User | Error>
) {
    switch (req.method) {
        case 'GET':
            let db = initFirebase();
            if (db === null) {
                console.log('failing 1');
                return;
            }

            const userId = req.query.id;
            if (typeof userId !== 'string') {
                console.log('failing 2');
                return;
            }

            await db
                .collection('users')
                .doc(userId)
                .get()
                .then((result) => {
                    const data = result.data();
                    res.status(200).json(data as User);
                });
            break;
        case 'PUT':
            res.status(200).json({ message: 'not implemented' });
            break;
        default:
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
