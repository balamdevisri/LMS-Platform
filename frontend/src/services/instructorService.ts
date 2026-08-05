import { auth, db } from '@/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

export interface InstructorUser {
  id: string;
  name: string;
  email: string;
  specialty: string;
  joined: string;
  assignedCourses: number;
  studentsCount: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected' | 'Verified' | 'Pending';
  avatar?: string;
  skills?: string[];
  experience?: string;
  appliedDate?: string;
  phone?: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string;
}

const LOCAL_STORAGE_KEY = 'shaivika_realtime_instructors_v2';
const MOCK_INSTRUCTOR_EMAILS = [
  'sarah.j@stanford.edu',
  'm.vance@ai.research.org',
  'elena.r@framer.com'
];

class InstructorService {
  private getLocalInstructors(): InstructorUser[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: InstructorUser[] = JSON.parse(saved);
        // Filter out legacy mock data
        return parsed.filter((i) => !MOCK_INSTRUCTOR_EMAILS.includes(i.email.toLowerCase()));
      }
    } catch (e) {
      console.warn('Failed to parse local instructors cache:', e);
    }
    return [];
  }

  private saveLocalInstructors(instructors: InstructorUser[]): void {
    const clean = instructors.filter((i) => !MOCK_INSTRUCTOR_EMAILS.includes(i.email.toLowerCase()));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clean));
  }

  /**
   * Subscribe to real-time instructor updates from Firestore database.
   */
  subscribeToInstructors(callback: (instructors: InstructorUser[]) => void): () => void {
    const localData = this.getLocalInstructors();
    callback(localData);

    if (!db) {
      return () => {};
    }

    try {
      const instructorsRef = collection(db, 'instructors');
      const unsubscribe = onSnapshot(
        instructorsRef,
        (snapshot) => {
          const firestoreInstructors: InstructorUser[] = [];
          
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const email = (data.email || '').toLowerCase();

            // Include real registered users with role 'instructor' from the instructors collection
            if (!MOCK_INSTRUCTOR_EMAILS.includes(email)) {
              firestoreInstructors.push({
                id: docSnap.id,
                name: data.name || data.fullName || data.displayName || 'Faculty Member',
                email: data.email || '',
                specialty: data.specialty || 'Linux & Systems Architecture',
                joined: data.createdAt
                  ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Recently',
                assignedCourses: data.assignedCourses || 1,
                studentsCount: data.studentsCount || '0',
                rating: data.rating || 5.0,
                status: data.status || 'pending',
                avatar: data.photoURL || '',
                skills: data.skills || ['Linux', 'Git', 'Python'],
                experience: data.experience || 'Not Specified',
                appliedDate: data.createdAt || new Date().toISOString(),
                phone: data.phone || '',
                approvedBy: data.approvedBy || null,
                approvedAt: data.approvedAt || null,
                rejectedAt: data.rejectedAt || null,
                rejectionReason: data.rejectionReason || '',
              });
            }
          });

          // Combine with locally created faculty (non-mock)
          const localOnly = localData.filter(
            (li) => !firestoreInstructors.some((fi) => fi.email.toLowerCase() === li.email.toLowerCase())
          );
          const finalInstructors = [...firestoreInstructors, ...localOnly];

          this.saveLocalInstructors(finalInstructors);
          callback(finalInstructors);
        },
        (error) => {
          console.warn('Realtime Firestore instructors listener notice:', error);
          callback(this.getLocalInstructors());
        }
      );

      return unsubscribe;
    } catch (e) {
      console.warn('Realtime subscription error:', e);
      return () => {};
    }
  }

  async addInstructor(name: string, email: string, specialty: string): Promise<InstructorUser> {
    const adminUid = auth?.currentUser?.uid || 'admin_onboard';
    const newInstructor: InstructorUser = {
      id: `inst_${Date.now()}`,
      name,
      email,
      specialty: specialty || 'Linux & System Architecture',
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      assignedCourses: 1,
      studentsCount: '0',
      rating: 5.0,
      status: 'approved',
      approvedBy: adminUid,
      approvedAt: new Date().toISOString(),
    };

    const current = this.getLocalInstructors();
    const updated = [newInstructor, ...current];
    this.saveLocalInstructors(updated);

    if (db) {
      try {
        const payload = {
          uid: newInstructor.id,
          id: newInstructor.id,
          name: newInstructor.name,
          fullName: newInstructor.name,
          email: newInstructor.email,
          specialty: newInstructor.specialty,
          role: 'instructor',
          status: 'approved',
          approvedBy: adminUid,
          approvedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignedCourses: 1,
          rating: 5.0,
        };

        await setDoc(doc(db, 'users', newInstructor.id), payload);
        await setDoc(doc(db, 'instructors', newInstructor.id), payload);
      } catch (err) {
        console.warn('Firestore add instructor notice:', err);
      }
    }

    // Dispatch approval email via Express Nodemailer SMTP Server
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiBaseUrl}/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'INSTRUCTOR_APPROVAL',
          recipientEmail: newInstructor.email.toLowerCase().trim(),
          payload: {
            instructorName: newInstructor.name,
            email: newInstructor.email.toLowerCase().trim(),
            status: 'approved',
            portalUrl: `${window.location.origin}/auth/login`,
            comments: `Instructor account manually onboarded by Administrator. Specialty: ${newInstructor.specialty}.`,
          },
        }),
      });
      console.log(`[SMTP Email Sent] Manually onboarded instructor approval email sent to ${newInstructor.email}`);
    } catch (smtpErr) {
      console.warn('Backend Nodemailer SMTP instructor approval dispatch notice:', smtpErr);
    }

    return newInstructor;
  }

  async approveInstructor(id: string, adminUid: string): Promise<void> {
    if (db) {
      try {
        const userRef = doc(db, 'users', id);
        const instructorRef = doc(db, 'instructors', id);
        const timestamp = new Date().toISOString();
        
        const updateData = {
          status: 'approved',
          approvedBy: adminUid,
          approvedAt: timestamp,
          rejectedAt: null,
          rejectionReason: null,
          updatedAt: timestamp,
        };

        await updateDoc(userRef, updateData);
        await updateDoc(instructorRef, updateData);

        console.log(`[Admin Approval] Approved instructor UID: ${id} by Admin: ${adminUid}`);

        // Fetch instructor details to send SMTP mail
        const userSnap = await getDoc(instructorRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          const name = data.name || data.fullName || 'Instructor';
          const email = data.email || '';
          
          // Send SMTP email
          try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBaseUrl}/email/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventType: 'INSTRUCTOR_APPROVAL',
                recipientEmail: email.toLowerCase().trim(),
                payload: {
                  instructorName: name,
                  email: email.toLowerCase().trim(),
                  status: 'approved',
                  portalUrl: `${window.location.origin}/auth/login`,
                  comments: 'Your application has been approved by the administrator.',
                },
              }),
            });
            if (response.ok) {
              console.log(`[SMTP Email Sent] Dispatched approval email to ${email}`);
            } else {
              console.warn('[SMTP Email Sent] Email API returned error status.');
            }
          } catch (smtpErr) {
            console.warn('Failed to send SMTP email:', smtpErr);
          }
        }
      } catch (err) {
        console.error('Failed to approve instructor:', err);
        throw err;
      }
    }
  }

  async rejectInstructor(id: string, adminUid: string, reason: string): Promise<void> {
    if (db) {
      try {
        const userRef = doc(db, 'users', id);
        const instructorRef = doc(db, 'instructors', id);
        const timestamp = new Date().toISOString();

        const updateData = {
          status: 'rejected',
          rejectedAt: timestamp,
          rejectionReason: reason,
          approvedBy: null,
          approvedAt: null,
          updatedAt: timestamp,
        };

        await updateDoc(userRef, updateData);
        await updateDoc(instructorRef, updateData);

        console.log(`[Admin Rejection] Rejected instructor UID: ${id} by Admin: ${adminUid}. Reason: ${reason}`);

        // Fetch instructor details to send SMTP mail
        const userSnap = await getDoc(instructorRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          const name = data.name || data.fullName || 'Instructor';
          const email = data.email || '';

          // Send SMTP email
          try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBaseUrl}/email/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventType: 'INSTRUCTOR_APPROVAL',
                recipientEmail: email.toLowerCase().trim(),
                payload: {
                  instructorName: name,
                  email: email.toLowerCase().trim(),
                  status: 'rejected',
                  portalUrl: `${window.location.origin}/auth/login`,
                  comments: `Rejection Reason: ${reason}`,
                },
              }),
            });
            if (response.ok) {
              console.log(`[SMTP Email Sent] Dispatched rejection email to ${email}`);
            } else {
              console.warn('[SMTP Email Sent] Rejection email API returned error status.');
            }
          } catch (smtpErr) {
            console.warn('Failed to send SMTP email:', smtpErr);
          }
        }
      } catch (err) {
        console.error('Failed to reject instructor:', err);
        throw err;
      }
    }
  }

  async updateInstructor(instructor: InstructorUser): Promise<void> {
    const current = this.getLocalInstructors();
    const existing = current.find((i) => i.id === instructor.id);
    const statusChanged = existing && existing.status !== instructor.status;

    const updated = current.map((i) => (i.id === instructor.id ? instructor : i));
    this.saveLocalInstructors(updated);

    if (db && instructor.id) {
      try {
        const updateData = {
          name: instructor.name,
          email: instructor.email,
          specialty: instructor.specialty,
          status: instructor.status,
          assignedCourses: instructor.assignedCourses,
          updatedAt: new Date().toISOString(),
        };

        await updateDoc(doc(db, 'users', instructor.id), updateData);
        await updateDoc(doc(db, 'instructors', instructor.id), updateData);
      } catch (err) {
        console.warn('Firestore update instructor notice:', err);
      }
    }

    if (statusChanged) {
      // Dispatch status update email via Express Nodemailer SMTP Server
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        await fetch(`${apiBaseUrl}/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'INSTRUCTOR_APPROVAL',
            recipientEmail: instructor.email.toLowerCase().trim(),
            payload: {
              instructorName: instructor.name,
              email: instructor.email.toLowerCase().trim(),
              status: instructor.status === 'approved' ? 'approved' : 'rejected',
              portalUrl: `${window.location.origin}/auth/login`,
              comments: `Instructor status updated by Administrator to ${instructor.status}.`,
            },
          }),
        });
        console.log(`[SMTP Email Sent] Status update email sent to ${instructor.email}`);
      } catch (smtpErr) {
        console.warn('Backend Nodemailer SMTP instructor update status email notice:', smtpErr);
      }
    }
  }

  async deleteInstructor(id: string): Promise<void> {
    const current = this.getLocalInstructors();
    const updated = current.filter((i) => i.id !== id);
    this.saveLocalInstructors(updated);

    if (db && id) {
      try {
        await deleteDoc(doc(db, 'users', id));
        await deleteDoc(doc(db, 'instructors', id));
      } catch (err) {
        console.warn('Firestore delete instructor notice:', err);
      }
    }
  }
}

export const instructorService = new InstructorService();
