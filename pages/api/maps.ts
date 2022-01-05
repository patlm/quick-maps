import { NextApiRequest, NextApiResponse } from 'next';
import initFirebase from '../../lib/firebase';
import { Map } from '../../models/map';
import { Marker } from '../../models/marker';
import { User } from '../../models/user';

type Error = {
    message: String;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Map | Map[] | Error>
) {
    let db = initFirebase();
    if (db === null) {
        console.log('failing 1');
        return;
    }

    switch (req.method) {
        case 'GET':
            const getReqMapData = await db.collection('maps').get();

            const maps: Map[] = [];
            getReqMapData.forEach((map) => {
                const m = map.data() as Map;

                maps.push({
                    creator: m.creator,
                    description: m.description,
                    id: m.id,
                    name: m.name,
                    resource: m.resource,
                    markers: [],
                });
            });

            for (const m of maps) {
                const coordinateData = await db
                    .collection('maps')
                    .doc(m.id)
                    .collection('coordinates')
                    .get();

                const coordinates: Marker[] = [];
                coordinateData.forEach((coordinate) => {
                    coordinates.push(coordinate.data() as Marker);
                });
                m.markers = coordinates;
            }

            res.status(200).json(maps);
            break;
        case 'POST':
            // Add map to db
            const map = req.body as Map;

            if (map === null) {
                // error
                return;
            }

            const mapData = db.collection('maps').doc();

            mapData.set({
                creator: map.creator,
                description: map.description,
                id: mapData.id,
                name: map.name,
                resource: map.resource,
            });

            // Add map to the creators list
            const creator = (
                await db.collection('users').doc(map.creator).get()
            ).data() as User;

            await db
                .collection('users')
                .doc(creator.uid)
                .set({
                    uid: creator.uid,
                    displayName: creator.displayName,
                    photoURL: creator.photoURL,
                    maps: [...creator.maps, mapData.id],
                });

            // Push the locations onto the db
            map.markers.forEach((marker) => {
                if (db !== null) {
                    const coorData = db
                        .collection('maps')
                        .doc(mapData.id)
                        .collection('coordinates')
                        .doc();

                    marker.id = coorData.id;
                    coorData.set(marker);
                }
            });

            res.status(200).json(map);
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
