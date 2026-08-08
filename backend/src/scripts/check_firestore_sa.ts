import * as admin from 'firebase-admin';

const serviceAccount = require('C:\\Users\\devis\\Downloads\\shaivika-ai-lms-platform-firebase-adminsdk-fbsvc-7426e84ada.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function main() {
  try {
    const snapshot = await db.collection('courses').get();
    console.log(`Successfully connected! Found ${snapshot.size} courses:`);
    snapshot.forEach(doc => {
      console.log(`- ${doc.id}: ${doc.data().title}`);
    });
  } catch (err) {
    console.error('Failed to fetch courses with Service Account:', err);
  }
  process.exit(0);
}

main();
