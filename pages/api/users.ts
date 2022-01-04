import { NextApiRequest, NextApiResponse } from 'next';
import initFirebase from '../../lib/firebase';
import { User } from '../../models/user';

type Error = {
    message: String;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<User | Error>
) {
    let db = initFirebase();
    if (db === null) {
        console.log('failing 1');
        return;
    }

    switch (req.method) {
        case 'POST':
            const user = req.body as User;

            if (user !== null) {
                const savedUser = (
                    await db.collection('users').doc(user.uid).get()
                ).data();

                if (savedUser !== undefined) {
                    db.collection('users')
                        .doc(user.uid)
                        .set({
                            uid: user.uid,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            maps: (savedUser as User).maps,
                        });
                } else {
                    db.collection('users').doc(user.uid).set(user);
                }

                res.status(200).json(user);
            }
            break;
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
