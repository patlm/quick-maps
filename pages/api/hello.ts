// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import initFirebase from '../../lib/firebase';

type Data = {
    name: string;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    console.log('test');

    let db = initFirebase();

    if (db === null) {
        return;
    }

    const docRef = db.collection('users').doc('alovelace');

    // await docRef.set({
    //     first: 'Ada',
    //     last: 'Lovelace',
    //     born: 1815,
    // });

    res.status(200).json({ name: 'John Doe' });
}
