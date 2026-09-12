import { db } from '../firebase';
import { couponService } from '../modules/coupons/coupon.service';
import { paymentService } from '../modules/payments/payment.service';

/**
 * COMPREHENSIVE AUTOMATED TEST SUITE: COUPON SYSTEM
 * Runs 22 distinct validation, calculation, concurrency, security, and idempotency tests.
 */
async function runCouponSystemTests() {
  console.log('====================================================');
  console.log('🧪 STARTING COMPREHENSIVE COUPON SYSTEM AUDIT & TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, details || '');
      failed++;
    }
  }

  const testSuffix = Date.now().toString().slice(-6);
  const adminId = 'test-admin-uid';
  const studentA = `test-student-A-${testSuffix}`;
  const studentB = `test-student-B-${testSuffix}`;
  const course1 = 'kubernetes-complete-course-beginner-to-advanced';
  const course2 = 'c-programming-course-id';
  const paidCourseId = `test_paid_track_${testSuffix}`;

  // Ensure test paid course exists in Firestore for order creation tests
  await db.collection('courses').doc(paidCourseId).set({
    id: paidCourseId,
    title: 'Paid Test Certification Track',
    price: 5000,
    isPublished: true,
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: Percentage Discount Calculation
    // -------------------------------------------------------------
    const c1 = await couponService.createCoupon(
      {
        code: `PERCENT20_${testSuffix}`,
        description: '20% Off Test',
        discountType: 'percentage',
        discountValue: 20,
        isActive: true,
      },
      adminId
    );

    const v1 = await couponService.validateCoupon({
      couponCode: `PERCENT20_${testSuffix}`,
      courseId: course1,
      userId: studentA,
      coursePrice: 5000,
    });
    assert(
      v1.valid && v1.discountAmount === 1000 && v1.finalPrice === 4000,
      'Test 1: 20% discount on ₹5000 gives discount of ₹1000 and final price ₹4000',
      v1
    );

    // -------------------------------------------------------------
    // TEST 2: Percentage Discount with Max Cap Enforcement
    // -------------------------------------------------------------
    const c2 = await couponService.createCoupon(
      {
        code: `MAXCAP50_${testSuffix}`,
        description: '50% Off with ₹500 Max Cap',
        discountType: 'percentage',
        discountValue: 50,
        maxDiscountAmount: 500,
        isActive: true,
      },
      adminId
    );

    const v2 = await couponService.validateCoupon({
      couponCode: `MAXCAP50_${testSuffix}`,
      courseId: course1,
      userId: studentA,
      coursePrice: 4000,
    });
    assert(
      v2.valid && v2.discountAmount === 500 && v2.finalPrice === 3500,
      'Test 2: 50% discount on ₹4000 with ₹500 cap is capped at ₹500 (final ₹3500)',
      v2
    );

    // -------------------------------------------------------------
    // TEST 3: Fixed Amount Discount
    // -------------------------------------------------------------
    const c3 = await couponService.createCoupon(
      {
        code: `FIXED300_${testSuffix}`,
        description: '₹300 Off Flat',
        discountType: 'fixed',
        discountValue: 300,
        isActive: true,
      },
      adminId
    );

    const v3 = await couponService.validateCoupon({
      couponCode: `FIXED300_${testSuffix}`,
      courseId: course1,
      userId: studentA,
      coursePrice: 2000,
    });
    assert(
      v3.valid && v3.discountAmount === 300 && v3.finalPrice === 1700,
      'Test 3: Fixed discount of ₹300 on ₹2000 gives final price ₹1700',
      v3
    );

    // -------------------------------------------------------------
    // TEST 4: Fixed Discount Exceeding Course Price (Floor at ₹0)
    // -------------------------------------------------------------
    const c4 = await couponService.createCoupon(
      {
        code: `OVERKILL_${testSuffix}`,
        description: '₹10000 Flat Off',
        discountType: 'fixed',
        discountValue: 10000,
        isActive: true,
      },
      adminId
    );

    const v4 = await couponService.validateCoupon({
      couponCode: `OVERKILL_${testSuffix}`,
      courseId: course1,
      userId: studentA,
      coursePrice: 2000,
    });
    assert(
      v4.valid && v4.discountAmount === 2000 && v4.finalPrice === 0,
      'Test 4: Fixed discount greater than price is floored at ₹0 (no negative prices)',
      v4
    );

    // -------------------------------------------------------------
    // TEST 5: 100% Discount Coupon (Full Free)
    // -------------------------------------------------------------
    const c5 = await couponService.createCoupon(
      {
        code: `FREE100_${testSuffix}`,
        description: '100% Free Voucher',
        discountType: 'percentage',
        discountValue: 100,
        isActive: true,
      },
      adminId
    );

    const v5 = await couponService.validateCoupon({
      couponCode: `FREE100_${testSuffix}`,
      courseId: course1,
      userId: studentA,
      coursePrice: 3000,
    });
    assert(
      v5.valid && v5.discountAmount === 3000 && v5.finalPrice === 0,
      'Test 5: 100% discount results in final price ₹0',
      v5
    );

    // -------------------------------------------------------------
    // TEST 6: Minimum Purchase Amount Met
    // -------------------------------------------------------------
    const c6 = await couponService.createCoupon(
      {
        code: `MIN1000_${testSuffix}`,
        description: 'Requires ₹1000 minimum purchase',
        discountType: 'fixed',
        discountValue: 200,
        minPurchaseAmount: 1000,
        isActive: true,
      },
      adminId
    );

    const v6 = await couponService.validateCoupon({
      couponCode: `MIN1000_${testSuffix}`,
      courseId: course1,
      userId: studentA,
      coursePrice: 1500,
    });
    assert(
      v6.valid && v6.finalPrice === 1300,
      'Test 6: Minimum purchase requirement satisfied (₹1500 >= ₹1000)',
      v6
    );

    // -------------------------------------------------------------
    // TEST 7: Minimum Purchase Amount NOT Met (Rejection)
    // -------------------------------------------------------------
    const v7 = await couponService.validateCoupon({
      couponCode: `MIN1000_${testSuffix}`,
      courseId: course1,
      userId: studentA,
      coursePrice: 800,
    });
    assert(
      !v7.valid && v7.code === 'MIN_PURCHASE_NOT_MET',
      'Test 7: Rejects coupon when course price is below minPurchaseAmount',
      v7
    );

    // -------------------------------------------------------------
    // TEST 8: Course Applicability Allowed
    // -------------------------------------------------------------
    const c8 = await couponService.createCoupon(
      {
        code: `K8SONLY_${testSuffix}`,
        description: 'Kubernetes Only',
        discountType: 'percentage',
        discountValue: 25,
        applicableCourses: [course1],
        isActive: true,
      },
      adminId
    );

    const v8 = await couponService.validateCoupon({
      couponCode: `K8SONLY_${testSuffix}`,
      courseId: course1,
      userId: studentA,
      coursePrice: 4000,
    });
    assert(
      v8.valid && v8.discountAmount === 1000,
      'Test 8: Course-specific coupon accepted for designated course',
      v8
    );

    // -------------------------------------------------------------
    // TEST 9: Course Applicability Ineligible (Rejection)
    // -------------------------------------------------------------
    const v9 = await couponService.validateCoupon({
      couponCode: `K8SONLY_${testSuffix}`,
      courseId: course2,
      userId: studentA,
      coursePrice: 2000,
    });
    assert(
      !v9.valid && v9.code === 'NOT_APPLICABLE_TO_COURSE',
      'Test 9: Rejects course-specific coupon when used on non-applicable course',
      v9
    );

    // -------------------------------------------------------------
    // TEST 10: Future Scheduled Coupon (Not Yet Active)
    // -------------------------------------------------------------
    const futureDate = new Date(Date.now() + 86400000 * 7).toISOString(); // 7 days in future
    const c10 = await couponService.createCoupon(
      {
        code: `FUTURE_${testSuffix}`,
        description: 'Future Coupon',
        discountType: 'percentage',
        discountValue: 15,
        startDate: futureDate,
        isActive: true,
      },
      adminId
    );

    const v10 = await couponService.validateCoupon({
      couponCode: `FUTURE_${testSuffix}`,
      courseId: course1,
      userId: studentA,
      coursePrice: 2000,
    });
    assert(
      !v10.valid && v10.code === 'NOT_YET_ACTIVE',
      'Test 10: Rejects scheduled coupon whose startDate is in the future',
      v10
    );

    // -------------------------------------------------------------
    // TEST 11: Expired Coupon Past End Date
    // -------------------------------------------------------------
    const pastDate = new Date(Date.now() - 86400000).toISOString(); // 1 day in past
    const c11 = await couponService.createCoupon(
      {
        code: `EXPIRED_${testSuffix}`,
        description: 'Expired Coupon',
        discountType: 'percentage',
        discountValue: 15,
        endDate: pastDate,
        isActive: true,
      },
      adminId
    );

    const v11 = await couponService.validateCoupon({
      couponCode: `EXPIRED_${testSuffix}`,
      courseId: course1,
      userId: studentA,
      coursePrice: 2000,
    });
    assert(
      !v11.valid && v11.code === 'EXPIRED',
      'Test 11: Rejects coupon past its endDate',
      v11
    );

    // -------------------------------------------------------------
    // TEST 12: Inactive Coupon
    // -------------------------------------------------------------
    const c12 = await couponService.createCoupon(
      {
        code: `DISABLED_${testSuffix}`,
        description: 'Deactivated Coupon',
        discountType: 'percentage',
        discountValue: 15,
        isActive: false,
      },
      adminId
    );

    const v12 = await couponService.validateCoupon({
      couponCode: `DISABLED_${testSuffix}`,
      courseId: course1,
      userId: studentA,
      coursePrice: 2000,
    });
    assert(
      !v12.valid && v12.code === 'INACTIVE',
      'Test 12: Rejects disabled / inactive coupon',
      v12
    );

    // -------------------------------------------------------------
    // TEST 13: Global Total Usage Limit Reached
    // -------------------------------------------------------------
    const c13 = await couponService.createCoupon(
      {
        code: `LIMIT1_${testSuffix}`,
        description: 'Only 1 usage total',
        discountType: 'fixed',
        discountValue: 100,
        totalUsageLimit: 1,
        isActive: true,
      },
      adminId
    );

    // Record 1 usage
    await couponService.recordCouponUsage({
      couponId: c13.id,
      orderId: `order_lim1_${testSuffix}`,
      paymentId: `pay_lim1_${testSuffix}`,
      userId: studentA,
      courseId: course1,
      originalPrice: 1000,
      discountAmount: 100,
      finalPrice: 900,
    });

    const v13 = await couponService.validateCoupon({
      couponCode: `LIMIT1_${testSuffix}`,
      courseId: course1,
      userId: studentB,
      coursePrice: 1000,
    });
    assert(
      !v13.valid && v13.code === 'USAGE_LIMIT_REACHED',
      'Test 13: Rejects when totalUsageLimit is exhausted',
      v13
    );

    // -------------------------------------------------------------
    // TEST 14: Per-User Usage Limit Reached
    // -------------------------------------------------------------
    const c14 = await couponService.createCoupon(
      {
        code: `USERLIMIT1_${testSuffix}`,
        description: '1 usage per student',
        discountType: 'fixed',
        discountValue: 100,
        totalUsageLimit: 100,
        perUserLimit: 1,
        isActive: true,
      },
      adminId
    );

    // Student A uses it
    await couponService.recordCouponUsage({
      couponId: c14.id,
      orderId: `order_userlim_${testSuffix}`,
      paymentId: `pay_userlim_${testSuffix}`,
      userId: studentA,
      courseId: course1,
      originalPrice: 1000,
      discountAmount: 100,
      finalPrice: 900,
    });

    // Student A tries to validate again
    const v14A = await couponService.validateCoupon({
      couponCode: `USERLIMIT1_${testSuffix}`,
      courseId: course1,
      userId: studentA,
      coursePrice: 1000,
    });
    assert(
      !v14A.valid && v14A.code === 'USER_LIMIT_REACHED',
      'Test 14A: Rejects second redemption by the same user when perUserLimit is 1',
      v14A
    );

    // Student B should still be allowed
    const v14B = await couponService.validateCoupon({
      couponCode: `USERLIMIT1_${testSuffix}`,
      courseId: course1,
      userId: studentB,
      coursePrice: 1000,
    });
    assert(
      v14B.valid && v14B.discountAmount === 100,
      'Test 14B: Allows different user when perUserLimit is not exceeded for that user',
      v14B
    );

    // -------------------------------------------------------------
    // TEST 15: Non-existent Coupon Code
    // -------------------------------------------------------------
    const v15 = await couponService.validateCoupon({
      couponCode: `NONEXISTENT_${Date.now()}`,
      courseId: course1,
      userId: studentA,
      coursePrice: 1000,
    });
    assert(
      !v15.valid && v15.code === 'NOT_FOUND',
      'Test 15: Rejects non-existent coupon code',
      v15
    );

    // -------------------------------------------------------------
    // TEST 16: Code Case-Insensitivity & Whitespace Normalization
    // -------------------------------------------------------------
    const v16 = await couponService.validateCoupon({
      couponCode: `  percent20_${testSuffix}  `,
      courseId: course1,
      userId: studentA,
      coursePrice: 1000,
    });
    assert(
      v16.valid && v16.code === `PERCENT20_${testSuffix}`,
      'Test 16: Normalizes lowercase and whitespace in coupon code input',
      v16
    );

    // -------------------------------------------------------------
    // TEST 17: Concurrent Order Checkout / Atomic Usage Counter
    // -------------------------------------------------------------
    const c17 = await couponService.createCoupon(
      {
        code: `RACE_${testSuffix}`,
        description: 'Race condition test',
        discountType: 'fixed',
        discountValue: 50,
        totalUsageLimit: 5,
        isActive: true,
      },
      adminId
    );

    // Fire 5 concurrent usages
    const promises = Array.from({ length: 5 }).map((_, idx) =>
      couponService.recordCouponUsage({
        couponId: c17.id,
        orderId: `race_order_${idx}_${testSuffix}`,
        paymentId: `race_pay_${idx}_${testSuffix}`,
        userId: `user_race_${idx}`,
        courseId: course1,
        originalPrice: 1000,
        discountAmount: 50,
        finalPrice: 950,
      })
    );
    await Promise.all(promises);

    const updatedC17 = await couponService.getCouponById(c17.id);
    assert(
      updatedC17?.totalUsed === 5,
      'Test 17: Concurrent transactions atomically incremented totalUsed to exactly 5',
      updatedC17
    );

    // -------------------------------------------------------------
    // TEST 18: Order Creation Authoritative Recalculation
    // -------------------------------------------------------------
    // Even if client attempts to pass no price or old price, backend recalculates price from Firestore
    const order18 = await paymentService.createOrder({
      courseId: paidCourseId,
      studentId: `student_spoof_${testSuffix}`,
      studentEmail: 'student@example.com',
      studentName: 'Student Spoof',
      couponCode: `PERCENT20_${testSuffix}`,
    });
    assert(
      order18.success &&
        order18.couponApplied === true &&
        order18.discountAmount! > 0 &&
        order18.finalAmount! < order18.originalAmount!,
      'Test 18: Server authoritatively recalculates coupon discount on order creation',
      order18
    );

    // -------------------------------------------------------------
    // TEST 19: 100% Free Order Auto-Verification & Enrollment
    // -------------------------------------------------------------
    const order19 = await paymentService.createOrder({
      courseId: paidCourseId,
      studentId: `student_free_${testSuffix}`,
      studentEmail: 'free@example.com',
      studentName: 'Student Free',
      couponCode: `FREE100_${testSuffix}`,
    });
    assert(
      order19.success && order19.finalAmount === 0 && order19.enrollment != null,
      'Test 19: 100% discount order activates enrollment immediately with ₹0 due',
      order19
    );

    // -------------------------------------------------------------
    // TEST 20: Payment Verification Idempotency
    // -------------------------------------------------------------
    const c20 = await couponService.createCoupon(
      {
        code: `IDEMP_${testSuffix}`,
        description: 'Idempotency test',
        discountType: 'fixed',
        discountValue: 100,
        isActive: true,
      },
      adminId
    );

    const orderId20 = `order_idemp_${testSuffix}`;
    const paymentId20 = `pay_idemp_${testSuffix}`;

    // First recording
    await couponService.recordCouponUsage({
      couponId: c20.id,
      orderId: orderId20,
      paymentId: paymentId20,
      userId: studentA,
      courseId: course1,
      originalPrice: 1000,
      discountAmount: 100,
      finalPrice: 900,
    });

    const c20AfterFirst = await couponService.getCouponById(c20.id);
    const countAfterFirst = c20AfterFirst?.totalUsed || 0;

    // Retry / duplicate verification call with same orderId & couponId
    await couponService.recordCouponUsage({
      couponId: c20.id,
      orderId: orderId20,
      paymentId: paymentId20,
      userId: studentA,
      courseId: course1,
      originalPrice: 1000,
      discountAmount: 100,
      finalPrice: 900,
    });

    const c20AfterSecond = await couponService.getCouponById(c20.id);
    assert(
      c20AfterSecond?.totalUsed === countAfterFirst,
      'Test 20: Duplicate payment verification is idempotent and does not double-increment totalUsed',
      { countAfterFirst, countAfterSecond: c20AfterSecond?.totalUsed }
    );

    // -------------------------------------------------------------
    // TEST 21: Optimistic Concurrency Protection (409 Conflict)
    // -------------------------------------------------------------
    let conflictOccurred = false;
    try {
      await couponService.updateCoupon(
        c1.id,
        {
          discountValue: 30,
          expectedRevision: 999, // Stale revision
        },
        adminId
      );
    } catch (err: any) {
      if (err.status === 409 || err.code === 409) {
        conflictOccurred = true;
      }
    }
    assert(
      conflictOccurred,
      'Test 21: Prevents stale updates and throws 409 Conflict when expectedRevision does not match version',
      { conflictOccurred }
    );

    // -------------------------------------------------------------
    // TEST 22: Admin Toggle Status & Archive Integrity
    // -------------------------------------------------------------
    const c22 = await couponService.createCoupon(
      {
        code: `TOGGLE_${testSuffix}`,
        description: 'Toggle test',
        discountType: 'fixed',
        discountValue: 50,
        isActive: true,
      },
      adminId
    );

    await couponService.toggleCouponStatus(c22.id, false, adminId);
    const deactivated = await couponService.getCouponById(c22.id);

    await couponService.archiveCoupon(c22.id, adminId);
    const archived = await couponService.getCouponById(c22.id);

    assert(
      deactivated?.isActive === false && archived?.isArchived === true,
      'Test 22: Admin toggle and soft archive successfully update coupon lifecycle flags',
      { deactivated, archived }
    );

    // Clean up temporary test course
    await db.collection('courses').doc(paidCourseId).delete().catch(() => {});

  } catch (err: any) {
    console.error('💥 Unexpected error during test run:', err);
    failed++;
  } finally {
    await db.collection('courses').doc(paidCourseId).delete().catch(() => {});
  }

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCouponSystemTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
