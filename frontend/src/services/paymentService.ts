const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

export interface PaymentOrderResponse {
  success: boolean;
  alreadyEnrolled?: boolean;
  freeCourse?: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  course?: {
    id: string;
    title: string;
    price: number;
  };
  paymentId?: string;
  enrollment?: any;
  error?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  alreadyEnrolled?: boolean;
  payment?: any;
  enrollment?: any;
  error?: string;
}

export class PaymentService {
  /**
   * 1. Request backend to create a verified payment order
   */
  async createPaymentOrder(
    courseId: string,
    studentInfo: {
      uid: string;
      email?: string;
      name?: string;
    },
    token?: string
  ): Promise<PaymentOrderResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (studentInfo.uid) {
        headers['x-user-id'] = studentInfo.uid;
        if (studentInfo.email) headers['x-user-email'] = studentInfo.email;
      }

      const res = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          courseId,
          studentId: studentInfo.uid,
          studentEmail: studentInfo.email,
          studentName: studentInfo.name,
        }),
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      console.error('[PaymentService] createPaymentOrder error:', err);
      return {
        success: false,
        error: err?.message || 'Failed to initialize payment order',
      };
    }
  }

  /**
   * 2. Send transaction details for server-side verification
   */
  async verifyPayment(
    verificationData: {
      orderId: string;
      paymentId?: string;
      signature?: string;
      studentId: string;
      studentEmail?: string;
      studentName?: string;
      courseId?: string;
    },
    token?: string
  ): Promise<PaymentVerifyResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (verificationData.studentId) {
        headers['x-user-id'] = verificationData.studentId;
        if (verificationData.studentEmail) headers['x-user-email'] = verificationData.studentEmail;
      }

      const res = await fetch(`${API_BASE}/api/payments/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify(verificationData),
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      console.error('[PaymentService] verifyPayment error:', err);
      return {
        success: false,
        error: err?.message || 'Payment verification failed',
      };
    }
  }

  /**
   * 3. Fetch Payment details
   */
  async getPayment(paymentId: string, token?: string, studentId?: string): Promise<any> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (studentId) headers['x-user-id'] = studentId;

      const res = await fetch(`${API_BASE}/api/payments/${paymentId}`, { headers });
      return await res.json();
    } catch (err) {
      return null;
    }
  }
}

export const paymentService = new PaymentService();
