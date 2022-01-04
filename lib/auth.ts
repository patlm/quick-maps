import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { fireServiceConfig } from './fireConfig';

// Not used yet
export default function (): Auth | null {
    if (!getApps().length) {
        try {
            initializeApp({
                credential: cert(fireServiceConfig),
            });
            return getAuth();
        } catch (error) {
            console.log('Firebase admin initialization error', error);
            return null;
        }
    } else {
        return getAuth();
    }
}
