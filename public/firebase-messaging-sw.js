/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDGUg8xvUBzZQJJhlLN6GNfu61R2lx2Wxk",
  authDomain: "vertexglobalmarkets-c02e4.firebaseapp.com",
  projectId: "vertexglobalmarkets-c02e4",
  storageBucket: "vertexglobalmarkets-c02e4.firebasestorage.app",
  messagingSenderId: "465472314684",
  appId: "1:465472314684:web:8b183e4d512ba4a6f1d239",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || "New Notification", {
    body: body || "",
    icon: icon || "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data,
  });
});
