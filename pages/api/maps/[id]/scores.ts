import { NextApiRequest, NextApiResponse } from 'next';
import initFirebase from '../../../../lib/firebase';
import { LeaderboardEntry } from '../../../../models/leaderboardEntry';

type Error = {
    message: String;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<LeaderboardEntry | LeaderboardEntry[] | Error>
) {
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

    switch (req.method) {
        case 'GET':
            await db
                .collection('maps')
                .doc(mapId)
                .collection('leaderboard')
                .get()
                .then((result) => {
                    const entries: LeaderboardEntry[] = [];
                    result.forEach((entry) =>
                        entries.push(entry.data() as LeaderboardEntry)
                    );
                    entries.sort((a, b) => (a.score < b.score ? 1 : -1));
                    res.status(200).json(entries);
                })
                .catch((error) => {
                    res.status(500).json(error);
                });
            break;
        case 'POST':
            const b = req.body as LeaderboardEntry;

            if (b !== null) {
                const data = db
                    .collection('maps')
                    .doc(mapId)
                    .collection('leaderboard')
                    .doc();

                b.id = data.id;
                data.set(b);

                res.status(200).json(b);
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
