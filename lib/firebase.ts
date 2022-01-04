import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { fireServiceConfig } from './fireConfig';

export default function (): Firestore | null {
    if (!getApps().length) {
        try {
            initializeApp({
                credential: cert(fireServiceConfig),
            });
            return getFirestore();
        } catch (error) {
            console.log('Firebase admin initialization error', error);
            return null;
        }
    } else {
        return getFirestore();
    }
}
