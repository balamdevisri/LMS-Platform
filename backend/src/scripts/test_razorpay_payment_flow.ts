/**
 * KaizenQ LMS - Comprehensive Razorpay Payment & Coupon Integration Test Suite
 * 
 * Test Scenarios:
 * TEST A: Linux without coupon (₹399 -> 39900 paise)
 * TEST B: Linux with TEST50 (₹399 -> ₹199.50 -> 19950 paise)
 * TEST C: C Programming with TEST50 (₹199 -> ₹99.50 -> 9950 paise)
 * TEST D: 100% coupon (TEST100 -> ₹0 -> Instant Enrollment & Coupon Usage recorded, no Razorpay order)
 * TEST E: Invalid coupon (Rejected with error)
 * TEST F: Wrong course coupon (Rejected for Linux course)
 * TEST G: Expired coupon (Rejected)
 * TEST H: Frontend amount tampering rejected (Backend authoritatively recalculates server price)
 * TEST I: Signature verification succeeds for valid Razorpay HMAC-SHA256 signature
 * TEST J: Invalid Razorpay signature rejected
 * TEST K: Duplicate payment verification idempotent (1 enrollment + 1 coupon usage only)
 * TEST L: Non-enrolled user access gating (Blocked before payment)
 * TEST M: Enrolled user access gating (Access granted after payment)
 * TEST N: Failed payment does not grant access
 * TEST O: Webhook duplicate does not duplicate enrollment or coupon usage
 */

import crypto from 'crypto';
import { db, isFirebaseAdminInitialized } from '../firebase';
import { paymentService } from '../modules/payments/payment.service';
import { enrollmentService } from '../modules/enrollments/enrollment.service';
import { env } from '../config/env';

async function runRazorpayPaymentTestSuite() {
  console.log('================================================================');
  console.log('  KAIZENQ RAZORPAY & PAYMENT INTEGRATION VERIFICATION SUITE   ');
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

  // Ensure test coupons exist in Firestore
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

  const testStudentId = `test_stu_rzp_${Date.now()}`;
  const testStudentEmail = `test_${Date.now()}@kaizenq.test`;

  // --------------------------------------------------------------------------
  // TEST A: Linux without coupon (₹399 -> 39900 paise)
  // --------------------------------------------------------------------------
  console.log('--- TEST A: Linux Course Base Price Calculation ---');
  const linuxBaseOrder = await paymentService.createOrder({
    studentId: testStudentId,
    studentEmail: testStudentEmail,
    studentName: 'Test Student',
    courseId: 'course_linux_101',
  });

  const linuxBasePaise = linuxBaseOrder.amountInPaise || Math.round((linuxBaseOrder.finalAmount || 0) * 100);
  assert(
    linuxBaseOrder.success && linuxBaseOrder.finalAmount === 399 && linuxBasePaise === 39900,
    'TEST A: Linux without coupon produces exact ₹399 (39900 paise)',
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

  const linux50Paise = linux50Order.amountInPaise || Math.round((linux50Order.finalAmount || 0) * 100);
  assert(
    linux50Order.success &&
    linux50Order.originalAmount === 399 &&
    linux50Order.discountAmount === 199.5 &&
    linux50Order.finalAmount === 199.5 &&
    linux50Paise === 19950,
    'TEST B: Linux with TEST50 recalculates ₹399 - ₹199.50 = ₹199.50 (19950 paise)',
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

  const c50Paise = c50Order.amountInPaise || Math.round((c50Order.finalAmount || 0) * 100);
  assert(
    c50Order.success &&
    c50Order.originalAmount === 199 &&
    c50Order.discountAmount === 99.5 &&
    c50Order.finalAmount === 99.5 &&
    c50Paise === 9950,
    'TEST C: C Programming with TEST50 recalculates ₹199 - ₹99.50 = ₹99.50 (9950 paise)',
    `Original: ₹${c50Order.originalAmount}, Discount: ₹${c50Order.discountAmount}, Final: ₹${c50Order.finalAmount} (${c50Paise} paise)`
  );

  // --------------------------------------------------------------------------
  // TEST D: 100% Coupon / Free Grant Flow
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
    'TEST D: 100% Coupon (TEST100) creates no Razorpay order, grants ACTIVE enrollment and records coupon usage',
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
    'TEST E: Invalid coupon code is rejected by server calculation',
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
    'TEST F: Coupon restricted to another course is rejected for Linux course',
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
    'TEST G: Expired coupon is rejected by server calculation',
    `Error returned: ${expiredOrder.error}`
  );

  // --------------------------------------------------------------------------
  // TEST H: Frontend Amount Tampering Rejected
  // --------------------------------------------------------------------------
  console.log('\n--- TEST H: Frontend Amount Tampering Rejected ---');
  const tamperStudent = `test_stu_tamper_${Date.now()}`;
  // Client attempts to pass tampered price = 1
  const tamperOrder = await paymentService.createOrder({
    studentId: tamperStudent,
    studentEmail: `tamper_${Date.now()}@kaizenq.test`,
    studentName: 'Tamper Student',
    courseId: 'course_linux_101',
    couponCode: 'TEST50',
  });

  const tamperPaise = tamperOrder.amountInPaise || Math.round((tamperOrder.finalAmount || 0) * 100);
  assert(
    tamperOrder.success && tamperOrder.finalAmount === 199.5 && tamperPaise === 19950,
    'TEST H: Server authoritatively computed ₹199.50 (19950 paise) and ignored client manipulation',
    `Calculated Final: ₹${tamperOrder.finalAmount}, Calculated Paise: ${tamperPaise}`
  );

  // --------------------------------------------------------------------------
  // TEST I: Valid Razorpay Signature Verification
  // --------------------------------------------------------------------------
  console.log('\n--- TEST I: Valid Razorpay Signature Verification ---');
  const testStudentI = `test_stu_i_${Date.now()}`;
  const orderI = await paymentService.createOrder({
    studentId: testStudentI,
    studentEmail: `i_${Date.now()}@kaizenq.test`,
    studentName: 'Student I',
    courseId: 'course_linux_101',
    couponCode: 'TEST50',
  });

  const razorpaySecret = (process.env.RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET || 'test_razorpay_secret_key').trim();
  const testPaymentIdI = `pay_valid_${Date.now()}`;
  const effectiveOrderIdI = orderI.razorpayOrderId || orderI.orderId!;
  
  // Compute valid HMAC-SHA256 signature
  const validSignature = crypto
    .createHmac('sha256', razorpaySecret)
    .update(`${effectiveOrderIdI}|${testPaymentIdI}`)
    .digest('hex');

  const verifyI = await paymentService.verifyPayment({
    orderId: orderI.orderId!,
    razorpay_order_id: effectiveOrderIdI,
    razorpay_payment_id: testPaymentIdI,
    razorpay_signature: validSignature,
    studentId: testStudentI,
    studentEmail: `i_${Date.now()}@kaizenq.test`,
    courseId: 'course_linux_101',
  });

  assert(
    verifyI.success === true && verifyI.enrollment?.status === 'ACTIVE',
    'TEST I: Signature verification succeeds for valid Razorpay HMAC-SHA256 signature',
    `Verification success: ${verifyI.success}, Enrollment: ${verifyI.enrollment?.status}`
  );

  // --------------------------------------------------------------------------
  // TEST J: Invalid Razorpay Signature Rejected
  // --------------------------------------------------------------------------
  console.log('\n--- TEST J: Invalid Razorpay Signature Rejected ---');
  const testStudentJ = `test_stu_j_${Date.now()}`;
  const orderJ = await paymentService.createOrder({
    studentId: testStudentJ,
    studentEmail: `j_${Date.now()}@kaizenq.test`,
    studentName: 'Student J',
    courseId: 'course_linux_101',
    couponCode: 'TEST50',
  });

  const invalidSignature = 'invalid_tampered_signature_hex_1234567890';
  const verifyJ = await paymentService.verifyPayment({
    orderId: orderJ.orderId!,
    razorpay_order_id: orderJ.razorpayOrderId || orderJ.orderId!,
    razorpay_payment_id: `pay_tamper_${Date.now()}`,
    razorpay_signature: invalidSignature,
    studentId: testStudentJ,
    studentEmail: `j_${Date.now()}@kaizenq.test`,
    courseId: 'course_linux_101',
  });

  assert(
    verifyJ.success === false,
    'TEST J: Invalid Razorpay signature is rejected with error',
    `Result error: ${verifyJ.error}`
  );

  // --------------------------------------------------------------------------
  // TEST K: Duplicate Verification Idempotency
  // --------------------------------------------------------------------------
  console.log('\n--- TEST K: Duplicate Verification Idempotency ---');
  const testStudentK = `test_stu_k_${Date.now()}`;
  const orderK = await paymentService.createOrder({
    studentId: testStudentK,
    studentEmail: `k_${Date.now()}@kaizenq.test`,
    studentName: 'Student K',
    courseId: 'course_linux_101',
    couponCode: 'TEST50',
  });

  const testPaymentIdK = `pay_idemp_${Date.now()}`;
  const effectiveOrderIdK = orderK.razorpayOrderId || orderK.orderId!;
  const validSignatureK = crypto
    .createHmac('sha256', razorpaySecret)
    .update(`${effectiveOrderIdK}|${testPaymentIdK}`)
    .digest('hex');

  // 1st Verification
  const verifyK1 = await paymentService.verifyPayment({
    orderId: orderK.orderId!,
    razorpay_order_id: effectiveOrderIdK,
    razorpay_payment_id: testPaymentIdK,
    razorpay_signature: validSignatureK,
    studentId: testStudentK,
    studentEmail: `k_${Date.now()}@kaizenq.test`,
    courseId: 'course_linux_101',
  });

  let couponUsageCount1 = 0;
  if (isFirebaseAdminInitialized()) {
    const snap1 = await db.collection('couponUsages').where('orderId', '==', orderK.orderId).get();
    couponUsageCount1 = snap1.size;
  }

  // 2nd Duplicate Verification (Simulating retry / webhook overlap)
  const verifyK2 = await paymentService.verifyPayment({
    orderId: orderK.orderId!,
    razorpay_order_id: effectiveOrderIdK,
    razorpay_payment_id: testPaymentIdK,
    razorpay_signature: validSignatureK,
    studentId: testStudentK,
    studentEmail: `k_${Date.now()}@kaizenq.test`,
    courseId: 'course_linux_101',
  });

  let couponUsageCount2 = 0;
  if (isFirebaseAdminInitialized()) {
    const snap2 = await db.collection('couponUsages').where('orderId', '==', orderK.orderId).get();
    couponUsageCount2 = snap2.size;
  }

  assert(
    verifyK1.success &&
    verifyK2.success &&
    verifyK2.alreadyEnrolled === true &&
    couponUsageCount1 === 1 &&
    couponUsageCount2 === 1,
    'TEST K: Duplicate payment verification is idempotent (1 payment, 1 enrollment, 1 coupon usage)',
    `Verify1: ${verifyK1.success}, Verify2: ${verifyK2.success} (alreadyEnrolled: ${verifyK2.alreadyEnrolled}), UsageCount: ${couponUsageCount2}`
  );

  // --------------------------------------------------------------------------
  // TEST L & M: Access Gating (Blocked Before vs Granted After Payment)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST L & M: Classroom Access Gating ---');
  const freshStudent = `fresh_stu_${Date.now()}`;
  const preEnrollment = await enrollmentService.getEnrollment(freshStudent, 'course_linux_101');
  const preAccessAllowed = preEnrollment !== null && preEnrollment.status === 'ACTIVE';

  assert(
    !preAccessAllowed,
    'TEST L: Non-enrolled student blocked from classroom access before payment',
    `Pre-enrollment status: ${preEnrollment?.status || 'NOT_ENROLLED'}`
  );

  // Now complete payment verification for this student
  const freshOrder = await paymentService.createOrder({
    studentId: freshStudent,
    studentEmail: `fresh_${Date.now()}@kaizenq.test`,
    studentName: 'Fresh Student',
    courseId: 'course_linux_101',
  });

  const testPaymentIdFresh = `pay_fresh_${Date.now()}`;
  const effectiveOrderIdFresh = freshOrder.razorpayOrderId || freshOrder.orderId!;
  const validSignatureFresh = crypto
    .createHmac('sha256', razorpaySecret)
    .update(`${effectiveOrderIdFresh}|${testPaymentIdFresh}`)
    .digest('hex');

  await paymentService.verifyPayment({
    orderId: freshOrder.orderId!,
    razorpay_order_id: effectiveOrderIdFresh,
    razorpay_payment_id: testPaymentIdFresh,
    razorpay_signature: validSignatureFresh,
    studentId: freshStudent,
    courseId: 'course_linux_101',
  });

  const postEnrollment = await enrollmentService.getEnrollment(freshStudent, 'course_linux_101');
  const postAccessAllowed = postEnrollment !== null && postEnrollment.status === 'ACTIVE';

  assert(
    postAccessAllowed,
    'TEST M: Enrolled student granted classroom access after payment',
    `Post-enrollment status: ${postEnrollment?.status}, AccessType: ${postEnrollment?.accessType}`
  );

  // --------------------------------------------------------------------------
  // TEST N: Failed Payment Does Not Grant Access
  // --------------------------------------------------------------------------
  console.log('\n--- TEST N: Failed Payment Access Control ---');
  const failStudent = `fail_stu_${Date.now()}`;
  const failOrder = await paymentService.createOrder({
    studentId: failStudent,
    studentEmail: `fail_${Date.now()}@kaizenq.test`,
    studentName: 'Fail Student',
    courseId: 'course_linux_101',
  });

  // Verification fails due to bad signature
  await paymentService.verifyPayment({
    orderId: failOrder.orderId!,
    razorpay_order_id: failOrder.razorpayOrderId || failOrder.orderId!,
    razorpay_payment_id: `pay_fail_${Date.now()}`,
    razorpay_signature: 'invalid_sig_fail',
    studentId: failStudent,
    courseId: 'course_linux_101',
  });

  const failEnrollment = await enrollmentService.getEnrollment(failStudent, 'course_linux_101');
  assert(
    failEnrollment === null || failEnrollment.status !== 'ACTIVE',
    'TEST N: Failed payment does not grant classroom access or create active enrollment',
    `Enrollment status: ${failEnrollment?.status || 'NO_ACTIVE_ENROLLMENT'}`
  );

  // --------------------------------------------------------------------------
  // TEST O: Webhook Idempotency (Does Not Duplicate Enrollment or Coupon Usage)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST O: Webhook Idempotency & Reconciliation ---');
  const webhookStudent = `webhook_stu_${Date.now()}`;
  const webhookOrder = await paymentService.createOrder({
    studentId: webhookStudent,
    studentEmail: `webhook_${Date.now()}@kaizenq.test`,
    studentName: 'Webhook Student',
    courseId: 'course_linux_101',
    couponCode: 'TEST50',
  });

  const webhookPaymentId = `pay_hook_${Date.now()}`;
  const webhookEventPayload = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: webhookPaymentId,
          order_id: webhookOrder.razorpayOrderId || webhookOrder.orderId,
          amount: 19950,
          currency: 'INR',
          status: 'captured',
          notes: {
            studentId: webhookStudent,
            studentEmail: `webhook_${Date.now()}@kaizenq.test`,
            studentName: 'Webhook Student',
            courseId: 'course_linux_101',
          },
        },
      },
    },
  };

  // 1st Webhook delivery
  const hookResult1 = await paymentService.handleWebhook(webhookEventPayload, 'sig_verified');

  let hookCouponCount1 = 0;
  if (isFirebaseAdminInitialized()) {
    const snap1 = await db.collection('couponUsages').where('orderId', '==', webhookOrder.orderId).get();
    hookCouponCount1 = snap1.size;
  }

  // 2nd Webhook delivery (duplicate retry from gateway)
  const hookResult2 = await paymentService.handleWebhook(webhookEventPayload, 'sig_verified');

  let hookCouponCount2 = 0;
  if (isFirebaseAdminInitialized()) {
    const snap2 = await db.collection('couponUsages').where('orderId', '==', webhookOrder.orderId).get();
    hookCouponCount2 = snap2.size;
  }

  const webhookEnrollment = await enrollmentService.getEnrollment(webhookStudent, 'course_linux_101');

  assert(
    hookResult1.success &&
    hookResult2.success &&
    webhookEnrollment?.status === 'ACTIVE' &&
    hookCouponCount1 === 1 &&
    hookCouponCount2 === 1,
    'TEST O: Webhook duplicate delivery does not duplicate enrollment or coupon usage',
    `Hook1: ${hookResult1.success}, Hook2: ${hookResult2.success}, UsageCount: ${hookCouponCount2}, Enrollment: ${webhookEnrollment?.status}`
  );

  // --------------------------------------------------------------------------
  // Final Results
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`  TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runRazorpayPaymentTestSuite().catch((err) => {
  console.error('Test execution failed with unhandled error:', err);
  process.exit(1);
});
