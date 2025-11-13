import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Check if config is valid
const hasValidConfig = firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'placeholder' &&
  !firebaseConfig.apiKey.includes('your_') &&
  firebaseConfig.apiKey.startsWith('AIza');

let app;
let auth;

try {
  if (hasValidConfig) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
  } else {
    console.warn('⚠️ Firebase not configured. Please check your .env file and restart the server.');
    auth = null;
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.error('📖 Please check your Firebase configuration in frontend/.env file');
  console.error('📖 Make sure to restart the server after updating .env file');
  auth = null;
}

export { auth };
export default app;

