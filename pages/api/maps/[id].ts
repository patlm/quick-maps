import type { NextApiRequest, NextApiResponse } from 'next';
import initFirebase from '../../../lib/firebase';
import { Map } from '../../../models/map';
import { Marker } from '../../../models/marker';

type Error = {
    message: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Map | Error>
) {
    switch (req.method) {
        case 'GET':
            let db = initFirebase();
            if (db === null) {
                console.log('failing 1');
                return;
            }

            const mapId = req.query.id;
            if (typeof mapId !== 'string') {
                console.log('failing 2');
                return;
            }

            const data = await db
                .collection('maps')
                .doc(mapId)
                .collection('coordinates')
                .get();

            const els: Marker[] = [];
            data.forEach((ele) => {
                els.push(ele.data() as Marker);
            });

            await db
                .collection('maps')
                .doc(mapId)
                .get()
                .then((result) => {
                    const data = result.data();
                    if (!data) {
                        res.status(200).json({ message: 'Data not found' });
                        console.log('failing 3');
                        return;
                    }
                    const map: Map = {
                        creator: data.creator,
                        description: data.description,
                        id: data.id,
                        name: data.name,
                        resource: data.resource,
                        markers: els,
                    };
                    res.status(200).json(map);
                })
                .catch((error) => {
                    res.status(500).json(error);
                });
            break;
        case 'PUT':
            res.status(200).json({ message: 'not implemented' });
        default:
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
