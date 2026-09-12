import { db, isFirebaseAdminInitialized } from '../firebase';

const CANONICAL_PRICES: Record<string, number> = {
  'course_linux_101': 399,
  'linux-systems-administration-mastery': 399,
  'c-programming-course-id': 199,
  'c-programming': 199,
  'git-github-mastery': 199,
  'git-github-mastery-course-id': 199,
  'database-management-system': 299,
  'dbms-beginner-to-advanced': 299,
  'kubernetes-complete-course-beginner-to-advanced': 499,
  'kubernetes-complete-course': 499,
  'react-js-complete-course': 299,
  'python-through-oops-course-id': 299,
  'python-through-oops': 299,
  'java-through-oops-course-id': 299,
  'java-through-oops': 299,
  'web-development-fundamentals': 299,
  'web-development': 299,
  'prompt-engineering': 199,
};

async function updatePrices() {
  console.log('Updating canonical course prices in Firestore...');
  const snapshot = await db.collection('courses').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const id = doc.id;
    const slug = data.slug || '';
    
    let targetPrice: number | null = null;
    if (CANONICAL_PRICES[id] !== undefined) {
      targetPrice = CANONICAL_PRICES[id];
    } else if (CANONICAL_PRICES[slug] !== undefined) {
      targetPrice = CANONICAL_PRICES[slug];
    }

    if (targetPrice !== null && data.price !== targetPrice) {
      console.log(`[PRICE UPDATE] ${doc.id} (${data.title}) -> Price: ${data.price} -> ${targetPrice}`);
      await doc.ref.update({ price: targetPrice, updatedAt: new Date().toISOString() });
    } else {
      console.log(`[UNCHANGED] ${doc.id} (${data.title}) -> Price: ${data.price}`);
    }
  }

  console.log('\n--- VERIFICATION ---');
  const verifySnap = await db.collection('courses').get();
  verifySnap.docs.forEach((doc) => {
    const d = doc.data();
    console.log(`Doc ID: ${doc.id.padEnd(45)} | Slug: ${(d.slug || '').padEnd(45)} | Price: ₹${d.price} | Title: ${d.title}`);
  });
}

updatePrices()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error updating prices:', err);
    process.exit(1);
  });
