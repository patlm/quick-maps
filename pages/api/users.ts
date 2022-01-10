import { NextApiRequest, NextApiResponse } from 'next';
import initFirebase from '../../lib/firebase';
import { User } from '../../models/user';

type Error = {
    message: String;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<User | User[] | Error>
) {
    let db = initFirebase();
    if (db === null) {
        console.log('failing 1');
        return;
    }

    switch (req.method) {
        case 'GET':
            const users: User[] = [];
            const getReqUsers = await db.collection('users').get();
            getReqUsers.forEach((user) => {
                const u = user.data() as User;
                users.push(u);
            });
            res.status(200).json(users);
            break;
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
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
