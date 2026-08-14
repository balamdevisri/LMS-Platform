const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  courseId: string;
  courseTitle?: string;
  paymentId?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'COMPLETED';
  accessType: 'PAID' | 'FREE';
  enrolledAt: string;
  progressPercentage?: number;
}

export class EnrollmentService {
  /**
   * Fetch all courses enrolled by the authenticated student
   */
  async fetchMyCourses(studentId: string, token?: string): Promise<EnrollmentRecord[]> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (studentId) headers['x-user-id'] = studentId;

      const res = await fetch(`${API_BASE}/api/enrollments/my-courses`, { headers });
      const data = await res.json();
      if (data.success && Array.isArray(data.enrollments)) {
        return data.enrollments;
      }
      return [];
    } catch (err) {
      console.warn('[EnrollmentService] fetchMyCourses error:', err);
      return [];
    }
  }

  /**
   * Check enrollment status for a specific course
   */
  async checkCourseEnrollment(
    courseId: string,
    studentId: string,
    token?: string
  ): Promise<{ isEnrolled: boolean; enrollment?: EnrollmentRecord }> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (studentId) headers['x-user-id'] = studentId;

      const res = await fetch(`${API_BASE}/api/enrollments/${courseId}`, { headers });
      const data = await res.json();
      return {
        isEnrolled: Boolean(data.success && data.isEnrolled),
        enrollment: data.enrollment,
      };
    } catch (err) {
      return { isEnrolled: false };
    }
  }

  /**
   * Verify course access permissions
   */
  async verifyCourseAccess(
    courseId: string,
    studentId: string,
    token?: string
  ): Promise<{ hasAccess: boolean; message?: string }> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (studentId) headers['x-user-id'] = studentId;

      const res = await fetch(`${API_BASE}/api/enrollments/${courseId}/access`, { headers });
      const data = await res.json();
      return {
        hasAccess: Boolean(data.success && data.hasAccess),
        message: data.message,
      };
    } catch (err) {
      return { hasAccess: false, message: 'Connection error' };
    }
  }
}

export const enrollmentService = new EnrollmentService();
