import { db } from '../firebase';

async function main() {
  const snap = await db.collection('users').get();
  console.log('Total users in Firestore:', snap.size);
  snap.docs.forEach((d) => {
    const data = d.data();
    console.log(`- ${d.id}: email=${data.email}, role=${data.role}, status=${data.status}`);
  });
}

main().catch(console.error);
