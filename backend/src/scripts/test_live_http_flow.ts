/**
 * Live HTTP Razorpay Payment Endpoint Verification Script
 * Tests the running backend server at http://localhost:5000
 */

async function testLiveEndpoints() {
  console.log('Testing live HTTP Razorpay endpoints against http://localhost:5000...\n');
  const backendUrl = 'http://localhost:5000/api/payments';

  // 1. Test POST /create-order with TEST50 on Linux course
  console.log('1. Testing POST /api/payments/create-order with TEST50 (₹199.50)...');
  const studentUid = `http_test_stu_${Date.now()}`;
  try {
    const res = await fetch(`${backendUrl}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: studentUid,
        studentEmail: `http_${Date.now()}@test.com`,
        studentName: 'HTTP Test Student',
        courseId: 'course_linux_101',
        amount: 1, // Manipulated frontend price to test tamper protection!
        couponCode: 'TEST50',
      }),
    });

    const data = await res.json();
    console.log('Status code:', res.status);
    console.log('Response body:', JSON.stringify(data, null, 2));

    if (res.status === 200 && data.success) {
      console.log('✅ Correct: 200 returned with Razorpay order details & calculated paise amount.');
      console.log('   Final amount (INR):', data.amount);
      console.log('   Amount in paise:', data.amountInPaise);
      console.log('   Razorpay Order ID:', data.razorpayOrderId || data.orderId);
    }
  } catch (e: any) {
    console.error('HTTP test error:', e.message);
  }

  // 2. Test POST /enroll-free with 100% coupon TEST100
  console.log('\n2. Testing POST /api/payments/enroll-free with TEST100 (100% OFF)...');
  const freeStudentUid = `http_free_stu_${Date.now()}`;
  try {
    const res = await fetch(`${backendUrl}/enroll-free`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: freeStudentUid,
        studentEmail: `free_${Date.now()}@test.com`,
        studentName: 'Free Student',
        courseIds: ['course_linux_101'],
        couponCode: 'TEST100',
      }),
    });

    const data = await res.json();
    console.log('Status code:', res.status);
    console.log('Response body:', JSON.stringify(data, null, 2));
    if (res.status === 200 && data.success) {
      console.log('✅ Correct: 100% discount free enrollment succeeded via API endpoint!');
    }
  } catch (e: any) {
    console.error('HTTP free test error:', e.message);
  }

  // 3. Test POST /create-order with price tampering
  console.log('\n3. Testing POST /api/payments/create-order with tampered price (₹1 submitted)...');
  const tamperStudentUid = `http_tamper_stu_${Date.now()}`;
  try {
    const res = await fetch(`${backendUrl}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: tamperStudentUid,
        studentEmail: `tamper_${Date.now()}@test.com`,
        studentName: 'Tamper Student',
        courseId: 'course_linux_101',
        amount: 1, // Tampered price
        couponCode: 'TEST50',
      }),
    });

    const data = await res.json();
    console.log('Status code:', res.status);
    console.log('Response body:', JSON.stringify(data, null, 2));
    if (data.amount === 199.5 && data.amountInPaise === 19950) {
      console.log('✅ Correct: Backend authoritatively computed ₹199.50 (19950 paise) and ignored tampered ₹1!');
    }
  } catch (e: any) {
    console.error('HTTP tamper test error:', e.message);
  }
}

testLiveEndpoints().catch(console.error);
