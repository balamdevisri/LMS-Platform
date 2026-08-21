import * as admin from 'firebase-admin';

// Initialize Firebase Admin (adjust the credentials path to your service account key if needed, or rely on application default credentials)
// Ensure you have `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"` set in your environment if running standalone.

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const COURSE_PRICES: Record<string, number> = {
  'linux-systems-administration-mastery': 399,
  'git-github-mastery': 199,
  'dbms-beginner-to-advanced': 299,
  'kubernetes-complete-course': 499,
  'react-js-complete-course': 299,
  'c-programming': 199,
  'python-through-oops': 299,
  'java-through-oops': 299,
};

async function updatePricing() {
  console.log('Starting pricing update...');
  try {
    const coursesRef = db.collection('courses');
    const snapshot = await coursesRef.get();
    
    let updatedCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const slug = data.slug || doc.id;
      
      let newPrice = null;
      
      // Match by slug first
      if (COURSE_PRICES[slug]) {
        newPrice = COURSE_PRICES[slug];
      } else {
        // Attempt substring match as fallback
        const lowerTitle = (data.title || '').toLowerCase();
        for (const [key, price] of Object.entries(COURSE_PRICES)) {
          const simplifiedKey = key.replace(/-/g, ' ');
          if (lowerTitle.includes(simplifiedKey) || lowerTitle.includes(key.split('-')[0])) {
            newPrice = price;
            break;
          }
        }
      }

      if (newPrice !== null && data.price !== newPrice) {
        console.log(`Updating ${data.title} (${slug}) - Old Price: ${data.price} -> New Price: ${newPrice}`);
        await doc.ref.update({ price: newPrice });
        updatedCount++;
      } else if (newPrice === null) {
        console.log(`No matching price found for: ${data.title} (${slug})`);
        // Set a default affordable price
        await doc.ref.update({ price: 299 });
        updatedCount++;
      }
    }
    
    console.log(`Successfully updated ${updatedCount} courses.`);
  } catch (error) {
    console.error('Error updating prices:', error);
  }
}

updatePricing();
