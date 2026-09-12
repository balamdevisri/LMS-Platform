import { db, isFirebaseAdminInitialized } from '../firebase';
import { couponService } from '../modules/coupons/coupon.service';

async function updateTestCoupon() {
  console.log('Checking TEST50 coupon in Firestore...');
  const snap = await db.collection('coupons').where('normalizedCode', '==', 'TEST50').get();
  if (!snap.empty) {
    const docRef = snap.docs[0].ref;
    await docRef.update({
      totalUsageLimit: null,
      perUserUsageLimit: 100,
      isActive: true,
      isArchived: false,
      applicableCourseIds: ['*'],
      updatedAt: new Date().toISOString(),
    });
    console.log('Updated TEST50 coupon usage limits to unlimited.');
  }

  const v = await couponService.validateCoupon({
    couponCode: 'TEST50',
    courseId: 'course_linux_101',
    coursePrice: 399,
  });
  console.log('Validation result:', v);
}

updateTestCoupon()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
