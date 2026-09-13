import { db, isFirebaseAdminInitialized } from '../firebase';

async function audit() {
  console.log('Firebase initialized:', isFirebaseAdminInitialized());

  // 1. Search for all kubernetes courses in Firestore
  const allCoursesSnap = await db.collection('courses').get();
  const k8sCourses = allCoursesSnap.docs.filter(d => {
    const data = d.data();
    return d.id.includes('kubernetes') || (data.slug && data.slug.includes('kubernetes')) || (data.title && data.title.toLowerCase().includes('kubernetes'));
  });

  console.log('\n=== KUBERNETES COURSES IN FIRESTORE ===');
  for (const doc of k8sCourses) {
    const data = doc.data();
    console.log('----------------------------------------------------');
    console.log('Doc ID:', doc.id);
    console.log('  Title:', data.title);
    console.log('  Slug:', data.slug);
    console.log('  Price:', data.price);
    console.log('  Total Modules in doc.modules array:', Array.isArray(data.modules) ? data.modules.length : 'none');
    if (Array.isArray(data.modules)) {
      console.log('  doc.modules IDs/Titles:');
      data.modules.forEach((m: any, idx: number) => {
        const topicsCount = Array.isArray(m.topics) ? m.topics.length : 0;
        let unitsCount = 0;
        if (Array.isArray(m.topics)) {
          m.topics.forEach((t: any) => {
            unitsCount += Array.isArray(t.learningUnits) ? t.learningUnits.length : (Array.isArray(t.units) ? t.units.length : 0);
          });
        }
        console.log(`    [${idx + 1}] ID: ${m.id} | Order: ${m.order ?? m.orderIndex} | Title: ${m.title} | Topics: ${topicsCount} | Units: ${unitsCount}`);
      });
    }

    // Check subcollection courses/{doc.id}/modules
    const subModsSnap = await db.collection('courses').doc(doc.id).collection('modules').get();
    console.log(`  Canonical Subcollection courses/${doc.id}/modules count: ${subModsSnap.size}`);
    for (const smDoc of subModsSnap.docs) {
      const smData = smDoc.data();
      const lessonsSnap = await db.collection('courses').doc(doc.id).collection('modules').doc(smDoc.id).collection('lessons').get();
      console.log(`    SubMod: ${smDoc.id} | Order: ${smData.orderIndex ?? smData.order} | Title: ${smData.title} | SubLessons count: ${lessonsSnap.size}`);
    }
  }

  // 2. Fetch from Production API
  console.log('\n=== PRODUCTION API AUDIT (https://api.kaizenq.in) ===');
  try {
    const prodCourseRes = await fetch('https://api.kaizenq.in/api/courses/kubernetes-complete-course-beginner-to-advanced');
    const prodCourse = await prodCourseRes.json();
    console.log('Prod Course success:', prodCourse.success, 'ID:', prodCourse.data?.id || prodCourse.course?.id);
    const cData = prodCourse.data || prodCourse.course;
    if (cData) {
      console.log('  Prod Course Title:', cData.title);
      console.log('  Prod Course Modules Array Count:', cData.modules?.length);
      if (Array.isArray(cData.modules)) {
        cData.modules.forEach((m: any, idx: number) => {
          const topicsCount = Array.isArray(m.topics) ? m.topics.length : 0;
          let unitsCount = 0;
          if (Array.isArray(m.topics)) {
            m.topics.forEach((t: any) => {
              unitsCount += Array.isArray(t.learningUnits) ? t.learningUnits.length : (Array.isArray(t.units) ? t.units.length : 0);
            });
          }
          console.log(`    [${idx + 1}] ID: ${m.id} | Order: ${m.order ?? m.orderIndex} | Title: ${m.title} | Topics: ${topicsCount} | Units: ${unitsCount}`);
        });
      }
    }

    const prodModsRes = await fetch('https://api.kaizenq.in/api/courses/kubernetes-complete-course-beginner-to-advanced/modules');
    const prodMods = await prodModsRes.json();
    console.log('\nProd Modules Endpoint success:', prodMods.success, 'Count:', prodMods.data?.length);
    if (Array.isArray(prodMods.data)) {
      prodMods.data.forEach((m: any, idx: number) => {
        const topicsCount = Array.isArray(m.topics) ? m.topics.length : 0;
        let unitsCount = 0;
        if (Array.isArray(m.topics)) {
          m.topics.forEach((t: any) => {
            unitsCount += Array.isArray(t.learningUnits) ? t.learningUnits.length : (Array.isArray(t.units) ? t.units.length : 0);
          });
        }
        console.log(`    [${idx + 1}] ID: ${m.id} | Order: ${m.order ?? m.orderIndex} | Title: ${m.title} | Topics: ${topicsCount} | Units: ${unitsCount}`);
      });
    }
  } catch (err: any) {
    console.error('Prod fetch error:', err.message);
  }
}

audit().catch(console.error);
