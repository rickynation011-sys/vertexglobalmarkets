import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDGUg8xvUBzZQJJhlLN6GNfu61R2lx2Wxk",
  authDomain: "vertexglobalmarkets-c02e4.firebaseapp.com",
  projectId: "vertexglobalmarkets-c02e4",
  storageBucket: "vertexglobalmarkets-c02e4.firebasestorage.app",
  messagingSenderId: "465472314684",
  appId: "1:465472314684:web:8b183e4d512ba4a6f1d239",
  measurementId: "G-JELV7VNG91",
};

const app = initializeApp(firebaseConfig);

export async function getFirebaseMessaging() {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
}

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const token = await getToken(messaging, {
      vapidKey: "BAfDPy0OmG8DnRB22yGE4szZrMMpfWxQ1lHb_A_pgJKkZFrAY7yq9Ywj7QZ_Cx7PE4KQjH0OELnpRMJwRHn2DRU",
    });

    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  getFirebaseMessaging().then((messaging) => {
    if (messaging) {
      onMessage(messaging, callback);
    }
  });
}
