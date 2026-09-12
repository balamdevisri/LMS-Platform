import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  console.log('====================================================');
  console.log('=== 1. PRODUCTION (https://www.kaizenq.in) ===');
  console.log('====================================================');
  let prodCourses: any[] = [];
  try {
    const res = await fetch('https://www.kaizenq.in/api/courses?limit=100');
    console.log('HTTP Status:', res.status);
    const json = await res.json();
    prodCourses = json.data?.courses || json.data || [];
    console.log('Production Courses Count:', prodCourses.length, '| total field:', json.data?.total);
    prodCourses.forEach((c: any, idx: number) => {
      console.log(`[Prod ${idx + 1}] ID: ${c.id} | Slug: ${c.slug} | Title: "${c.title}" | Status: ${c.status} | CreatedAt: ${c.createdAt} | UpdatedAt: ${c.updatedAt}`);
    });
  } catch (e: any) {
    console.error('Error fetching prod:', e.message);
  }

  console.log('\n====================================================');
  console.log('=== 2. PRODUCTION DIRECT (https://kaizenq-backend.onrender.com) ===');
  console.log('====================================================');
  try {
    const res = await fetch('https://kaizenq-backend.onrender.com/api/courses?limit=100');
    console.log('HTTP Status:', res.status);
    const json = await res.json();
    const renderCourses = json.data?.courses || json.data || [];
    console.log('Render Courses Count:', renderCourses.length, '| total field:', json.data?.total);
    renderCourses.forEach((c: any, idx: number) => {
      console.log(`[Render ${idx + 1}] ID: ${c.id} | Slug: ${c.slug} | Title: "${c.title}" | Status: ${c.status} | CreatedAt: ${c.createdAt} | UpdatedAt: ${c.updatedAt}`);
    });
  } catch (e: any) {
    console.error('Error fetching render:', e.message);
  }

  console.log('\n====================================================');
  console.log('=== 3. LOCALHOST (http://localhost:5000) ===');
  console.log('====================================================');
  let localCourses: any[] = [];
  try {
    const res = await fetch('http://localhost:5000/api/courses?limit=100');
    console.log('HTTP Status:', res.status);
    const json = await res.json();
    localCourses = json.data?.courses || json.data || [];
    console.log('Localhost Courses Count:', localCourses.length, '| total field:', json.data?.total);
    localCourses.forEach((c: any, idx: number) => {
      console.log(`[Local ${idx + 1}] ID: ${c.id} | Slug: ${c.slug} | Title: "${c.title}" | Status: ${c.status} | CreatedAt: ${c.createdAt} | UpdatedAt: ${c.updatedAt}`);
    });
  } catch (e: any) {
    console.error('Error fetching local:', e.message);
  }

  console.log('\n====================================================');
  console.log('=== 4. DIRECT FIRESTORE COURSES COLLECTION AUDIT ===');
  console.log('====================================================');
  try {
    const { db } = await import('../firebase');
    const snapshot = await db.collection('courses').get();
    console.log('Total documents in Firestore `courses` collection:', snapshot.docs.length);
    snapshot.docs.forEach((doc, idx) => {
      const d = doc.data();
      console.log(`[Firestore Doc ${idx + 1}] ID: ${doc.id} | Slug: ${d.slug} | Title: "${d.title}" | Status: ${d.status} | isDeleted: ${d.isDeleted} | CreatedAt: ${d.createdAt} | modulesCount: ${d.modules?.length ?? 'none'}`);
    });
  } catch (e: any) {
    console.error('Error querying Firestore:', e);
  }
}

run();
