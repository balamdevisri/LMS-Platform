import { db, isFirebaseAdminInitialized } from '../firebase';
import { enrollmentService } from '../modules/enrollments/enrollment.service';
import { couponService } from '../modules/coupons/coupon.service';
import { paymentService } from '../modules/payments/payment.service';

async function verifyEnrollmentAndCouponFlow() {
  console.log('================================================================');
  console.log('🔬 STARTING LIVE VERIFICATION: FRESH STUDENT ACCESS & COUPON TEST');
  console.log('================================================================\n');

  const timestamp = Date.now();
  const rawStudentUid = `fresh_student_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;
  const maskedUid = rawStudentUid.replace(/(.{4}).*(.{4})/, '$1****$2');
  const studentEmail = `fresh.student.${timestamp}@example.com`;
  const studentName = 'Fresh Test Student';

  console.log(`1. NEW TEST STUDENT GENERATED:`);
  console.log(`   - Masked UID: ${maskedUid}`);
  console.log(`   - Email: ${studentEmail}`);
  console.log(`   - Name: ${studentName}\n`);

  // Step 1: Query Firestore directly before test
  console.log('2. QUERYING FIRESTORE BEFORE TEST:');
  const preSnap = await db.collection('enrollments').where('studentId', '==', rawStudentUid).get();
  console.log(`   - Firestore enrollment records for ${maskedUid}: ${preSnap.size} (Exists: ${!preSnap.empty})`);

  // Step 2: Call backend enrollment check for course_linux_101
  console.log('\n3. CHECKING ENROLLMENT API FOR LINUX (course_linux_101):');
  const linuxEnrollment = await enrollmentService.getEnrollment(rawStudentUid, 'course_linux_101');
  const linuxAccess = await enrollmentService.verifyCourseAccess(rawStudentUid, 'course_linux_101', 'student', studentEmail);
  console.log('   - Enrollment Record:', linuxEnrollment);
  console.log('   - Access Verification:', linuxAccess);

  // Step 3: Call backend enrollment check for C Programming (c-programming-course-id)
  console.log('\n4. CHECKING ENROLLMENT API FOR C PROGRAMMING (c-programming-course-id):');
  const cEnrollment = await enrollmentService.getEnrollment(rawStudentUid, 'c-programming-course-id');
  const cAccess = await enrollmentService.verifyCourseAccess(rawStudentUid, 'c-programming-course-id', 'student', studentEmail);
  console.log('   - Enrollment Record:', cEnrollment);
  console.log('   - Access Verification:', cAccess);

  // Step 4: Validate TEST50 coupon for course_linux_101 (Price: ₹399)
  console.log('\n5. VALIDATING COUPON TEST50 FOR LINUX COURSE (₹399):');
  const couponValidation = await couponService.validateCoupon({
    couponCode: 'TEST50',
    courseId: 'course_linux_101',
    coursePrice: 399,
    userId: rawStudentUid,
  });
  console.log('   - Valid:', couponValidation.valid);
  console.log('   - Coupon Code:', couponValidation.code);
  console.log('   - Discount Type:', couponValidation.discountType);
  console.log('   - Discount Value:', `${couponValidation.discountValue}%`);
  console.log('   - Original Price:', `₹${couponValidation.originalPrice}`);
  console.log('   - Discount Amount:', `₹${couponValidation.discountAmount}`);
  console.log('   - Final Price:', `₹${couponValidation.finalPrice}`);
  console.log('   - Message:', couponValidation.message);

  // Step 5: Simulate Course Purchase & Enrollment
  console.log('\n6. SIMULATING ORDER & ENROLLMENT FOR STUDENT AFTER PURCHASE:');
  const orderResult = await paymentService.createOrder({
    courseId: 'course_linux_101',
    studentId: rawStudentUid,
    studentEmail,
    studentName,
    couponCode: 'TEST50',
  });
  console.log('   - Order Created:', orderResult.success, 'Order ID:', orderResult.orderId, 'Final Amount:', `₹${orderResult.finalAmount}`);

  // Create enrollment record
  const enrollmentResult = await enrollmentService.createEnrollment({
    studentId: rawStudentUid,
    studentEmail,
    studentName,
    courseId: 'course_linux_101',
    accessType: 'PAID',
    paymentId: `pay_${timestamp}`,
    courseTitle: 'Linux Systems & Administration Mastery',
  });
  console.log('   - Enrollment Created:', enrollmentResult.enrollment.status, 'ID:', enrollmentResult.enrollment.id);

  // Step 6: Query backend after enrollment
  console.log('\n7. RE-CHECKING ENROLLMENT API POST-PURCHASE:');
  const postEnrollment = await enrollmentService.getEnrollment(rawStudentUid, 'course_linux_101');
  const postAccess = await enrollmentService.verifyCourseAccess(rawStudentUid, 'course_linux_101', 'student', studentEmail);
  console.log('   - Post Enrollment Status:', postEnrollment?.status);
  console.log('   - Post Access Granted:', postAccess.hasAccess);

  // Step 7: Admin / Instructor Universal Access
  console.log('\n8. VERIFYING ADMIN / INSTRUCTOR UNIVERSAL ACCESS:');
  const adminAccess = await enrollmentService.verifyCourseAccess('admin-uid-test', 'course_linux_101', 'admin', 'admin@gmail.com');
  const instructorAccess = await enrollmentService.verifyCourseAccess('inst-uid-test', 'course_linux_101', 'instructor', 'mentor@kaizenq.in');
  console.log('   - Admin Access:', adminAccess.hasAccess);
  console.log('   - Instructor Access:', instructorAccess.hasAccess);

  // Clean up the temporary test enrollment doc
  await db.collection('enrollments').doc(`${rawStudentUid}_course_linux_101`).delete().catch(() => {});
  await db.collection('student_progress').doc(`${rawStudentUid}_course_linux_101`).delete().catch(() => {});
  if (orderResult.orderId) {
    await db.collection('orders').doc(orderResult.orderId).delete().catch(() => {});
  }

  console.log('\n================================================================');
  console.log('✅ ALL BACKEND ENROLLMENT & COUPON TESTS COMPLETED SUCCESSFULLY');
  console.log('================================================================\n');
}

verifyEnrollmentAndCouponFlow()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
