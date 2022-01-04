import { ServiceAccount } from 'firebase-admin/app';
import app from 'firebase/app';

export const fireServiceConfig: ServiceAccount = {
    projectId: process.env.FB_PROJECT_ID,
    clientEmail: process.env.FB_CLIENT_EMAIL,
    privateKey: process.env.FB_PRIVATE_KEY,
};

export const fireClientConfig: app.FirebaseOptions = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    databaseURL: undefined,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    appId: process.env.FB_APP_ID,
    measurementId: process.env.FB_MEASUREMENT_ID,
    projectId: process.env.FB_PROJECT_ID,
    messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
};
