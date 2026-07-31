const firebaseConfig = {
  apiKey: 'AIzaSyDmIWQAMLNrTTehrGPhhWCOSK6idwNoFxw',
  authDomain: 'app-message-push-a3eef.firebaseapp.com',
  projectId: 'app-message-push-a3eef',
  storageBucket: 'app-message-push-a3eef.firebasestorage.app',
  messagingSenderId: '712488130034',
  appId: '1:712488130034:web:53613035796a1bd8ac876b'
};

const VAPID_KEY = 'BN3MDRoU5_1syHPZIbPtrI8_aAYIVPf7qhVNrNN0xKnFkDNCuhC8SKjdlWlYLN7-QqGEug-zgac9r2-eLyq72iw';
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycby0Ub48y7MF1y9soeHXPP7Kr8zuaiXfDA96SE0EDIbzF-9ozmoENxKIIwq4IOU033zkmQ/exec';

let swRegistration = null;

async function enableLiveTrackNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('PalmCrest Hub: push notifications are not supported in this browser.');
    return false;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const messaging = firebase.messaging();

  // Foreground messages don't trigger the service worker's background
  // handler — the payload arrives here instead, so show it manually.
  messaging.onMessage(function (payload) {
    const notification = payload.notification || {};
    const title = notification.title || 'PalmCrest';
    const body = notification.body || '';
    if (Notification.permission === 'granted') {
      new Notification(title, { body: body, icon: '/icon.png' });
    }
  });

  try {
    swRegistration = swRegistration || await navigator.serviceWorker.register('firebase-messaging-sw.js');
  } catch (err) {
    console.error('PalmCrest Hub: service worker registration failed.', err);
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('PalmCrest Hub: notification permission was not granted.');
    return false;
  }

  let token;
  try {
    token = await messaging.getToken({
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration
    });
  } catch (err) {
    console.error('PalmCrest Hub: could not get push token.', err);
    return false;
  }

  if (!token) {
