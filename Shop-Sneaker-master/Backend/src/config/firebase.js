import admin from "firebase-admin";

let firebaseApp = null;

export const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin initialized with service account");
    } else if (process.env.FIREBASE_PROJECT_ID) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log("✅ Firebase Admin initialized with application default credentials");
    } else {
      console.warn("⚠️  No Firebase credentials found. Firebase Auth will not work.");
    }

    return firebaseApp;
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error.message);
    return null;
  }
};

export const getFirebaseAuth = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp ? admin.auth() : null;
};

export default admin;
