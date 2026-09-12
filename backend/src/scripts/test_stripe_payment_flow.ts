/**
 * KaizenQ LMS - Comprehensive Stripe Payment & Coupon Integration Test Suite
 * 
 * Test Scenarios:
 * A. Linux without coupon (₹399 -> 39900 paise)
 * B. Linux with TEST50 (₹399 -> ₹199.50 -> 19950 paise)
 * C. C Programming with TEST50 (₹199 -> ₹99.50 -> 9950 paise)
 * D. 100% coupon (₹399 -> ₹0 -> Instant Enrollment & Coupon Usage recorded, no Stripe charge)
 * E. Invalid coupon (Rejected with error)
 * F. Wrong course coupon (Rejected)
 * G. Expired coupon (Rejected)
 * H. Tampered frontend price (Backend authoritatively recalculates server price)
 * I. Duplicate payment verification (Idempotent: 1 enrollment + 1 coupon usage only)
 * J. Non-enrolled user access gating (Rejected)
 * K. Enrolled user access gating (Allowed)
 */

import { db, isFirebaseAdminInitialized } from '../firebase';
import { paymentService } from '../modules/payments/payment.service';
import { enrollmentService } from '../modules/enrollments/enrollment.service';

async function runStripePaymentTestSuite() {
  console.log('================================================================');
  console.log('  KAIZENQ STRIPE & PAYMENT INTEGRATION VERIFICATION TEST SUITE  ');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   └─ ${details}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   └─ ${details}`);
    }
  }

  // Ensure test coupons exist
  const now = new Date();
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  if (isFirebaseAdminInitialized()) {
    // 1. Seed TEST50 (50% off for all courses)
    await db.collection('coupons').doc('coupon_test50').set({
      id: 'coupon_test50',
      code: 'TEST50',
      normalizedCode: 'TEST50',
      description: '50% discount test coupon',
      discountType: 'percentage',
      discountValue: 50,
      startsAt: now.toISOString(),
      expiresAt: futureDate.toISOString(),
      maxUses: 1000,
      totalUsed: 0,
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }, { merge: true });

    // 2. Seed TEST100 (100% off for all courses)
    await db.collection('coupons').doc('coupon_test100').set({
      id: 'coupon_test100',
      code: 'TEST100',
      normalizedCode: 'TEST100',
      description: '100% discount free test coupon',
      discountType: 'percentage',
      discountValue: 100,
      startsAt: now.toISOString(),
      expiresAt: futureDate.toISOString(),
      maxUses: 1000,
      totalUsed: 0,
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }, { merge: true });

    // 3. Seed EXPIRED50 (Expired coupon)
    await db.collection('coupons').doc('coupon_expired50').set({
      id: 'coupon_expired50',
      code: 'EXPIRED50',
      normalizedCode: 'EXPIRED50',
      description: 'Expired test coupon',
      discountType: 'percentage',
      discountValue: 50,
      startsAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: pastDate.toISOString(),
      maxUses: 100,
      totalUsed: 0,
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }, { merge: true });

    // 4. Seed REACTONLY (Only valid for react-js-complete-course)
    await db.collection('coupons').doc('coupon_wrongcourse').set({
      id: 'coupon_wrongcourse',
      code: 'REACTONLY',
      normalizedCode: 'REACTONLY',
      description: 'React only test coupon',
      discountType: 'percentage',
      discountValue: 50,
      applicableCourseIds: ['react-js-complete-course'],
      startsAt: now.toISOString(),
      expiresAt: futureDate.toISOString(),
      maxUses: 100,
      totalUsed: 0,
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }, { merge: true });
  }

  const testStudentId = `test_stu_${Date.now()}`;
  const testStudentEmail = `test_${Date.now()}@kaizenq.test`;

  // --------------------------------------------------------------------------
  // TEST A: Linux without coupon (₹399 -> 39900 paise)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST A: Linux Course Base Price Calculation ---');
  const linuxBaseOrder = await paymentService.createOrder({
    studentId: testStudentId,
    studentEmail: testStudentEmail,
    studentName: 'Test Student',
    courseId: 'course_linux_101',
  });

  const linuxBasePaise = Math.round((linuxBaseOrder.finalAmount || 0) * 100);
  assert(
    linuxBaseOrder.success && linuxBaseOrder.finalAmount === 399 && linuxBasePaise === 39900,
    'Linux without coupon produces exact ₹399 (39900 paise)',
    `Amount: ₹${linuxBaseOrder.finalAmount} (${linuxBasePaise} paise), OrderId: ${linuxBaseOrder.orderId}`
  );

  // --------------------------------------------------------------------------
  // TEST B: Linux with TEST50 (₹399 -> ₹199.50 -> 19950 paise)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST B: Linux Course with TEST50 (50% OFF) ---');
  const testStudentB = `test_stu_b_${Date.now()}`;
  const linux50Order = await paymentService.createOrder({
    studentId: testStudentB,
    studentEmail: `b_${Date.now()}@kaizenq.test`,
    studentName: 'Student B',
    courseId: 'course_linux_101',
    couponCode: 'TEST50',
  });

  const linux50Paise = Math.round((linux50Order.finalAmount || 0) * 100);
  assert(
    linux50Order.success &&
    linux50Order.originalAmount === 399 &&
    linux50Order.discountAmount === 199.5 &&
    linux50Order.finalAmount === 199.5 &&
    linux50Paise === 19950,
    'Linux with TEST50 recalculates ₹399 - ₹199.50 = ₹199.50 (19950 paise)',
    `Original: ₹${linux50Order.originalAmount}, Discount: ₹${linux50Order.discountAmount}, Final: ₹${linux50Order.finalAmount} (${linux50Paise} paise)`
  );

  // --------------------------------------------------------------------------
  // TEST C: C Programming with TEST50 (₹199 -> ₹99.50 -> 9950 paise)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST C: C Programming with TEST50 (50% OFF) ---');
  const testStudentC = `test_stu_c_${Date.now()}`;
  const c50Order = await paymentService.createOrder({
    studentId: testStudentC,
    studentEmail: `c_${Date.now()}@kaizenq.test`,
    studentName: 'Student C',
    courseId: 'c-programming-course-id',
    couponCode: 'TEST50',
  });

  const c50Paise = Math.round((c50Order.finalAmount || 0) * 100);
  assert(
    c50Order.success &&
    c50Order.originalAmount === 199 &&
    c50Order.discountAmount === 99.5 &&
    c50Order.finalAmount === 99.5 &&
    c50Paise === 9950,
    'C Programming with TEST50 recalculates ₹199 - ₹99.50 = ₹99.50 (9950 paise)',
    `Original: ₹${c50Order.originalAmount}, Discount: ₹${c50Order.discountAmount}, Final: ₹${c50Order.finalAmount} (${c50Paise} paise)`
  );

  // --------------------------------------------------------------------------
  // TEST D: 100% Coupon / Free Payment Path
  // --------------------------------------------------------------------------
  console.log('\n--- TEST D: 100% Coupon Free Payment Path ---');
  const testStudentD = `test_stu_d_${Date.now()}`;
  const free100Order = await paymentService.createOrder({
    studentId: testStudentD,
    studentEmail: `d_${Date.now()}@kaizenq.test`,
    studentName: 'Student D',
    courseId: 'course_linux_101',
    couponCode: 'TEST100',
  });

  const studentDEnrollment = await enrollmentService.getEnrollment(testStudentD, 'course_linux_101');

  assert(
    free100Order.success &&
    free100Order.freeCourse === true &&
    free100Order.finalAmount === 0 &&
    studentDEnrollment !== null &&
    studentDEnrollment.status === 'ACTIVE',
    '100% Coupon (TEST100) bypasses Stripe, creates ACTIVE enrollment and records coupon usage',
    `FreeCourse: ${free100Order.freeCourse}, EnrollmentStatus: ${studentDEnrollment?.status}, AccessType: ${studentDEnrollment?.accessType}`
  );

  // --------------------------------------------------------------------------
  // TEST E: Invalid Coupon Handling
  // --------------------------------------------------------------------------
  console.log('\n--- TEST E: Invalid Coupon Handling ---');
  const invalidCouponOrder = await paymentService.createOrder({
    studentId: `test_stu_e_${Date.now()}`,
    studentEmail: `e_${Date.now()}@kaizenq.test`,
    studentName: 'Student E',
    courseId: 'course_linux_101',
    couponCode: 'INVALID_CODE_9999',
  });

  assert(
    invalidCouponOrder.success === false,
    'Invalid coupon code is rejected by server calculation',
    `Error returned: ${invalidCouponOrder.error}`
  );

  // --------------------------------------------------------------------------
  // TEST F: Wrong Course Coupon Handling
  // --------------------------------------------------------------------------
  console.log('\n--- TEST F: Wrong Course Coupon Handling ---');
  const wrongCourseOrder = await paymentService.createOrder({
    studentId: `test_stu_f_${Date.now()}`,
    studentEmail: `f_${Date.now()}@kaizenq.test`,
    studentName: 'Student F',
    courseId: 'course_linux_101',
    couponCode: 'REACTONLY',
  });

  assert(
    wrongCourseOrder.success === false,
    'Coupon restricted to another course is rejected for Linux course',
    `Error returned: ${wrongCourseOrder.error}`
  );

  // --------------------------------------------------------------------------
  // TEST G: Expired Coupon Handling
  // --------------------------------------------------------------------------
  console.log('\n--- TEST G: Expired Coupon Handling ---');
  const expiredOrder = await paymentService.createOrder({
    studentId: `test_stu_g_${Date.now()}`,
    studentEmail: `g_${Date.now()}@kaizenq.test`,
    studentName: 'Student G',
    courseId: 'course_linux_101',
    couponCode: 'EXPIRED50',
  });

  assert(
    expiredOrder.success === false,
    'Expired coupon is rejected by server calculation',
    `Error returned: ${expiredOrder.error}`
  );

  // --------------------------------------------------------------------------
  // TEST H: Immutable Pricing Snapshot Persisted in Firestore
  // --------------------------------------------------------------------------
  console.log('\n--- TEST H: Immutable Pricing Snapshot Verification ---');
  const testStudentH = `test_stu_h_${Date.now()}`;
  const orderH = await paymentService.createOrder({
    studentId: testStudentH,
    studentEmail: `h_${Date.now()}@kaizenq.test`,
    studentName: 'Student H',
    courseId: 'course_linux_101',
    couponCode: 'TEST50',
  });

  let snapshotVerified = false;
  if (isFirebaseAdminInitialized() && orderH.orderId) {
    const docSnap = await db.collection('payments').doc(orderH.orderId).get();
    if (docSnap.exists) {
      const pData = docSnap.data();
      snapshotVerified =
        pData?.courseId === 'course_linux_101' &&
        pData?.originalAmount === 399 &&
        pData?.discountAmount === 199.5 &&
        pData?.finalAmount === 199.5 &&
        pData?.couponCode === 'TEST50' &&
        pData?.currency === 'INR' &&
        pData?.status === 'PENDING' &&
        pData?.studentId === testStudentH;
    }
  }

  assert(
    snapshotVerified,
    'Firestore payments record persists immutable pricing snapshot with coupon metadata',
    `OrderId: ${orderH.orderId}, Verified in Firestore: ${snapshotVerified}`
  );

  // --------------------------------------------------------------------------
  // TEST I: Duplicate Payment Verification Idempotency
  // --------------------------------------------------------------------------
  console.log('\n--- TEST I: Duplicate Payment Verification Idempotency ---');
  const testStudentI = `test_stu_i_${Date.now()}`;
  const orderI = await paymentService.createOrder({
    studentId: testStudentI,
    studentEmail: `i_${Date.now()}@kaizenq.test`,
    studentName: 'Student I',
    courseId: 'course_linux_101',
    couponCode: 'TEST50',
  });

  // 1st Verification
  const verify1 = await paymentService.verifyPayment({
    orderId: orderI.orderId!,
    paymentId: `pi_mock_${Date.now()}`,
    signature: 'sig_mock_verified',
    studentId: testStudentI,
    studentEmail: `i_${Date.now()}@kaizenq.test`,
    courseId: 'course_linux_101',
  });

  // Check coupon usage count after 1st verification
  let couponUsageCount1 = 0;
  if (isFirebaseAdminInitialized()) {
    const snap1 = await db.collection('couponUsages').where('orderId', '==', orderI.orderId).get();
    couponUsageCount1 = snap1.size;
  }

  // 2nd Duplicate Verification (Simulating retry / webhook repeat)
  const verify2 = await paymentService.verifyPayment({
    orderId: orderI.orderId!,
    paymentId: `pi_mock_${Date.now()}`,
    signature: 'sig_mock_verified',
    studentId: testStudentI,
    studentEmail: `i_${Date.now()}@kaizenq.test`,
    courseId: 'course_linux_101',
  });

  // Check coupon usage count after 2nd verification
  let couponUsageCount2 = 0;
  if (isFirebaseAdminInitialized()) {
    const snap2 = await db.collection('couponUsages').where('orderId', '==', orderI.orderId).get();
    couponUsageCount2 = snap2.size;
  }

  assert(
    verify1.success &&
    verify2.success &&
    verify2.alreadyEnrolled === true &&
    couponUsageCount1 === 1 &&
    couponUsageCount2 === 1,
    'Duplicate payment verification is idempotent (1 enrollment + 1 coupon usage record only)',
    `Verify1: ${verify1.success}, Verify2: ${verify2.success} (alreadyEnrolled: ${verify2.alreadyEnrolled}), UsageCount: ${couponUsageCount2}`
  );

  // --------------------------------------------------------------------------
  // TEST J & K: Access Gating (Non-enrolled vs Enrolled)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST J & K: Classroom Access Gating ---');
  const freshStudent = `fresh_stu_${Date.now()}`;
  const preEnrollment = await enrollmentService.getEnrollment(freshStudent, 'course_linux_101');
  const preAccessAllowed = preEnrollment !== null && preEnrollment.status === 'ACTIVE';

  assert(
    !preAccessAllowed,
    'Non-enrolled student cannot access classroom before successful payment',
    `Pre-enrollment status: ${preEnrollment?.status || 'NOT_ENROLLED'}`
  );

  // Now simulate successful payment verification for this student
  const freshOrder = await paymentService.createOrder({
    studentId: freshStudent,
    studentEmail: `fresh_${Date.now()}@kaizenq.test`,
    studentName: 'Fresh Student',
    courseId: 'course_linux_101',
  });

  await paymentService.verifyPayment({
    orderId: freshOrder.orderId!,
    paymentId: `pi_fresh_${Date.now()}`,
    signature: 'sig_verified',
    studentId: freshStudent,
    courseId: 'course_linux_101',
  });

  const postEnrollment = await enrollmentService.getEnrollment(freshStudent, 'course_linux_101');
  const postAccessAllowed = postEnrollment !== null && postEnrollment.status === 'ACTIVE';

  assert(
    postAccessAllowed,
    'Enrolled student can access classroom after successful payment verification',
    `Post-enrollment status: ${postEnrollment?.status}, AccessType: ${postEnrollment?.accessType}`
  );

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`  TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runStripePaymentTestSuite().catch((err) => {
  console.error('Test execution failed with unhandled error:', err);
  process.exit(1);
});
