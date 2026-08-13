import { auth, db } from '@/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
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
  approved?: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
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
   * Get a fresh Firebase ID token from the currently logged-in user.
   * Falls back to localStorage token if no user is active.
   */
  private async getFreshToken(): Promise<string> {
    try {
      if (auth?.currentUser) {
        // Force refresh = true to always get a valid, non-expired token
        const freshToken = await auth.currentUser.getIdToken(true);
        if (freshToken) {
          localStorage.setItem('shaivika_auth_token', freshToken);
          localStorage.setItem('token', freshToken);
          return freshToken;
        }
      }
    } catch (e) {
      console.warn('[INSTRUCTOR SERVICE] Token refresh notice:', e);
    }
    // Fallback to cached token
    return localStorage.getItem('shaivika_auth_token') || localStorage.getItem('token') || '';
  }

  /**
   * Directly fetch all instructors from backend API using a FRESH auth token.
   */
  async fetchFirestoreInstructorsDirectly(): Promise<InstructorUser[]> {
    const currentLocal = this.getLocalInstructors();
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      // Always get a fresh token — never use expired cached token
      const token = await this.getFreshToken();

      console.log(`[INSTRUCTOR SERVICE] Fetching from: ${apiBaseUrl}/admin/instructors`);
      console.log(`[INSTRUCTOR SERVICE] Fresh token present: ${!!token}`);

      const response = await fetch(`${apiBaseUrl}/admin/instructors`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      console.log(`[INSTRUCTOR SERVICE] Backend response status: ${response.status}`);

      if (response.ok) {
        const json = await response.json();
        console.log(`[INSTRUCTOR SERVICE] Backend returned: success=${json.success}, count=${json.count}`);

        if (json.success && Array.isArray(json.data)) {
          const fetched: InstructorUser[] = json.data.map((data: any) => ({
            id: data.id || data.uid,
            name: data.fullName || data.name || data.displayName || 'Faculty Member',
            email: data.email || '',
            specialty: data.department || data.specialty || 'Linux & Systems Architecture',
            joined: data.createdAt
              ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recently',
            assignedCourses: data.assignedCourses || 1,
            studentsCount: data.studentsCount || '0',
            rating: data.rating || 5.0,
            status: data.status || (data.approved ? 'approved' : 'pending'),
            approved: data.approved,
            avatar: data.photoURL || '',
            skills: data.skills || ['Linux', 'Git', 'Python'],
            experience: data.experience || 'Not Specified',
            appliedDate: data.createdAt || new Date().toISOString(),
            phone: data.phone || '',
            approvedBy: data.approvedBy || null,
            approvedAt: data.approvedAt || null,
            rejectedAt: data.rejectedAt || null,
            rejectionReason: data.rejectionReason || data.rejectReason || '',
          }));

          const combinedMap = new Map<string, InstructorUser>();
          fetched.forEach((inst) => combinedMap.set(inst.id, inst));
          currentLocal.forEach((inst) => {
            if (!combinedMap.has(inst.id)) combinedMap.set(inst.id, inst);
          });

          const finalInstructors = Array.from(combinedMap.values());
          console.log(`[INSTRUCTOR SERVICE] REST result: ${finalInstructors.length} total instructors`);
          this.saveLocalInstructors(finalInstructors);
          return finalInstructors;
        }
      } else {
        console.warn(`[INSTRUCTOR SERVICE] Backend returned ${response.status} — will use Firestore client queries.`);
      }
    } catch (e) {
      console.warn('[INSTRUCTOR SERVICE] REST fetch error:', e);
    }
    return currentLocal;
  }

  /**
   * One-shot Firestore getDocs fetch — reads users with role=instructor directly.
   * Used as an immediate data source before onSnapshot listeners warm up.
   */
  async fetchFromFirestoreDirectly(): Promise<InstructorUser[]> {
    if (!db) return [];
    try {
      const map = new Map<string, InstructorUser>();

      // Query 1: users collection where role == 'instructor'
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'instructor'));
        const snap = await getDocs(q);
        console.log(`[INSTRUCTOR SERVICE] getDocs(users where role==instructor): ${snap.size} docs`);
        snap.forEach((docSnap) => {
          const mapped = this.mapDocToInstructor(docSnap);
          if (mapped) map.set(mapped.id, mapped);
        });
      } catch (e) {
        console.warn('[INSTRUCTOR SERVICE] users query notice:', e);
      }

      // Query 2: instructors collection
      try {
        const instSnap = await getDocs(collection(db, 'instructors'));
        console.log(`[INSTRUCTOR SERVICE] getDocs(instructors collection): ${instSnap.size} docs`);
        instSnap.forEach((docSnap) => {
          if (!map.has(docSnap.id)) {
            const mapped = this.mapDocToInstructor(docSnap);
            if (mapped) map.set(mapped.id, mapped);
          }
        });
      } catch (e) {
        console.warn('[INSTRUCTOR SERVICE] instructors collection query notice:', e);
      }

      // Fallback Query 3: if still empty, scan all users client-side
      if (map.size === 0) {
        console.log(`[INSTRUCTOR SERVICE] Zero results from queries — scanning all users...`);
        const allSnap = await getDocs(collection(db, 'users'));
        allSnap.forEach((docSnap) => {
          const data = docSnap.data();
          const roleRaw = (data.role || '').toLowerCase();
          if (roleRaw === 'instructor') {
            const mapped = this.mapDocToInstructor(docSnap);
            if (mapped) map.set(mapped.id, mapped);
          }
        });
      }

      const results = Array.from(map.values());
      console.log(`[INSTRUCTOR SERVICE] Direct Firestore read result: ${results.length} instructors`);
      return results;
    } catch (e) {
      console.warn('[INSTRUCTOR SERVICE] getDocs error:', e);
      return [];
    }
  }


  /**
   * Helper to map a Firestore doc snapshot to InstructorUser shape.
   */
  private mapDocToInstructor(docSnap: any): InstructorUser | null {
    const data = docSnap.data();
    const email = (data.email || '').toLowerCase();
    if (MOCK_INSTRUCTOR_EMAILS.includes(email)) return null;

    // Accept docs where role is 'instructor' (any casing) OR where specialty/department is set and no role set yet
    const roleRaw = (data.role || '').toLowerCase();
    const isInstructorDoc = roleRaw === 'instructor' || (docSnap.ref && docSnap.ref.path && docSnap.ref.path.startsWith('instructors/')) || Boolean(data.specialty);
    if (!isInstructorDoc) return null;

    const statusRaw = ((data.status || '') as string).toLowerCase();
    const normalizedStatus: InstructorUser['status'] =
      statusRaw === 'approved' || data.approved === true ? 'approved'
        : statusRaw === 'rejected' ? 'rejected'
        : 'pending';

    return {
      id: docSnap.id,
      name: data.fullName || data.name || data.displayName || 'Faculty Member',
      email: data.email || '',
      specialty: data.department || data.specialty || 'Linux & Systems Architecture',
      joined: data.createdAt
        ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recently',
      assignedCourses: data.assignedCourses || 1,
      studentsCount: data.studentsCount || '0',
      rating: data.rating || 5.0,
      status: normalizedStatus,
      approved: data.approved === true || normalizedStatus === 'approved',
      avatar: data.photoURL || '',
      skills: data.skills || ['Linux', 'Git', 'Python'],
      experience: data.experience || 'Not Specified',
      appliedDate: data.createdAt || new Date().toISOString(),
      phone: data.phone || '',
      approvedBy: data.approvedBy || null,
      approvedAt: data.approvedAt || null,
      rejectedAt: data.rejectedAt || null,
      rejectionReason: data.rejectionReason || data.rejectReason || '',
    };
  }

  /**
   * Subscribe to real-time instructor updates.
   * Strategy:
   * 1. Immediately emit localStorage cache (avoids blank flash)
   * 2. Fire a one-shot getDocs (immediate Firestore read, no token expiry issue)
   * 3. REST API call with fresh token via auth.currentUser.getIdToken()
   * 4. Two live onSnapshot listeners for real-time updates
   */
  subscribeToInstructors(callback: (instructors: InstructorUser[]) => void): () => void {
    // Step 1: Emit localStorage cache immediately
    const localData = this.getLocalInstructors();
    callback(localData); // Always call (even if empty) so loading=false fires

    // Step 2: One-shot immediate Firestore getDocs (uses Firebase SDK auth, not localStorage token)
    this.fetchFromFirestoreDirectly().then((instructors) => {
      console.log(`[INSTRUCTOR SERVICE] One-shot getDocs returned ${instructors.length} instructors`);
      const merged = this.mergeWithLocal(instructors);
      callback(merged);
    });

    // Step 3: REST API with fresh token
    this.fetchFirestoreInstructorsDirectly().then((instructors) => {
      if (instructors.length > 0) {
        console.log(`[INSTRUCTOR SERVICE] REST sync returned ${instructors.length} instructors`);
        callback(instructors);
      }
    });

    if (!db) {
      return () => {};
    }

    let filteredResult: InstructorUser[] = [];
    let allUsersResult: InstructorUser[] = [];
    let instructorsColResult: InstructorUser[] = [];

    const emit = () => {
      const combined = new Map<string, InstructorUser>();
      filteredResult.forEach(i => combined.set(i.id, i));
      allUsersResult.forEach(i => combined.set(i.id, i));
      instructorsColResult.forEach(i => combined.set(i.id, i));
      const result = Array.from(combined.values());
      console.log(`[INSTRUCTOR SERVICE] onSnapshot merged — total: ${result.length}`);
      this.saveLocalInstructors(result);
      callback(result);
    };

    const unsubscribers: (() => void)[] = [];

    try {
      // Strategy 1: Filtered onSnapshot on users collection (where role==instructor)
      const filteredQuery = query(collection(db, 'users'), where('role', '==', 'instructor'));
      const unsubFiltered = onSnapshot(
        filteredQuery,
        (snapshot) => {
          console.log(`[INSTRUCTOR SERVICE] onSnapshot(role==instructor): ${snapshot.size} docs`);
          filteredResult = [];
          snapshot.forEach((docSnap) => {
            const mapped = this.mapDocToInstructor(docSnap);
            if (mapped) filteredResult.push(mapped);
          });
          emit();
        },
        (err) => console.warn('[INSTRUCTOR SERVICE] Filtered onSnapshot error:', err)
      );
      unsubscribers.push(unsubFiltered);
    } catch (e) {
      console.warn('[INSTRUCTOR SERVICE] Filtered subscription error:', e);
    }

    try {
      // Strategy 2: All-users onSnapshot with client-side filter
      const allUsersQuery = query(collection(db, 'users'));
      const unsubAll = onSnapshot(
        allUsersQuery,
        (snapshot) => {
          console.log(`[INSTRUCTOR SERVICE] onSnapshot(all-users): ${snapshot.size} total docs`);
          allUsersResult = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const roleRaw = (data.role || '').toLowerCase();
            if (roleRaw === 'instructor') {
              const mapped = this.mapDocToInstructor(docSnap);
              if (mapped) allUsersResult.push(mapped);
            }
          });
          emit();
        },
        (err) => console.warn('[INSTRUCTOR SERVICE] All-users onSnapshot error:', err)
      );
      unsubscribers.push(unsubAll);
    } catch (e) {
      console.warn('[INSTRUCTOR SERVICE] All-users subscription error:', e);
    }

    try {
      // Strategy 3: Real-time onSnapshot on instructors collection
      const instQuery = collection(db, 'instructors');
      const unsubInst = onSnapshot(
        instQuery,
        (snapshot) => {
          console.log(`[INSTRUCTOR SERVICE] onSnapshot(instructors collection): ${snapshot.size} docs`);
          instructorsColResult = [];
          snapshot.forEach((docSnap) => {
            const mapped = this.mapDocToInstructor(docSnap);
            if (mapped) instructorsColResult.push(mapped);
          });
          emit();
        },
        (err) => console.warn('[INSTRUCTOR SERVICE] Instructors collection onSnapshot error:', err)
      );
      unsubscribers.push(unsubInst);
    } catch (e) {
      console.warn('[INSTRUCTOR SERVICE] Instructors collection subscription error:', e);
    }

    return () => unsubscribers.forEach(fn => fn());
  }

  /**
   * Merge a fetched list with localStorage, deduplicating by ID.
   */
  private mergeWithLocal(fetched: InstructorUser[]): InstructorUser[] {
    const localData = this.getLocalInstructors();
    const combined = new Map<string, InstructorUser>();
    fetched.forEach(i => combined.set(i.id, i));
    localData.forEach(i => { if (!combined.has(i.id)) combined.set(i.id, i); });
    const result = Array.from(combined.values());
    this.saveLocalInstructors(result);
    return result;
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
      approved: true,
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
          department: newInstructor.specialty,
          role: 'instructor',
          approved: true,
          status: 'approved',
          isActive: true,
          approvedBy: adminUid,
          approvedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignedCourses: 1,
          rating: 5.0,
        };

        await setDoc(doc(db, 'users', newInstructor.id), payload, { merge: true });
        console.log(`[INSTRUCTOR SERVICE AUDIT] Manually added instructor written to users/${newInstructor.id}`);
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
    const timestamp = new Date().toISOString();
    const updateData = {
      approved: true,
      status: 'approved' as const,
      isActive: true,
      approvedBy: adminUid,
      approvedAt: timestamp,
      rejectedAt: null,
      rejectionReason: null,
      updatedAt: timestamp,
    };

    // 1. Immediately update local storage and notify active listeners for zero latency
    const local = this.getLocalInstructors();
    const updatedLocal = local.map((inst) =>
      inst.id === id ? { ...inst, ...updateData } : inst
    );
    this.saveLocalInstructors(updatedLocal);

    if (db) {
      try {
        const userRef = doc(db, 'users', id);
        const instructorRef = doc(db, 'instructors', id);
        
        await setDoc(userRef, updateData, { merge: true }).catch((err) => {
          console.warn('[Admin Approval] Firestore user doc write notice:', err.message);
        });
        await setDoc(instructorRef, updateData, { merge: true }).catch((err) => {
          console.warn('[Admin Approval] Firestore instructor doc write notice:', err.message);
        });
        console.log(`[Admin Approval] Approved instructor UID: ${id} by Admin: ${adminUid}`);

        // Fetch instructor details from users collection to send SMTP mail
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            const name = data.name || data.fullName || 'Instructor';
            const email = data.email || '';
            
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
                  comments: 'Your instructor application has been approved by the administrator.',
                },
              }),
            });
            if (response.ok) {
              console.log(`[SMTP Email Sent] Dispatched approval email to ${email}`);
            }
          }
        } catch (smtpErr) {
          console.warn('Failed to send SMTP email:', smtpErr);
        }
      } catch (err) {
        console.warn('Failed to sync instructor approval to Firestore:', err);
      }
    }
  }

  async rejectInstructor(id: string, adminUid: string, reason: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const updateData = {
      approved: false,
      status: 'rejected' as const,
      isActive: false,
      rejectedAt: timestamp,
      rejectionReason: reason,
      approvedBy: null,
      approvedAt: null,
      updatedAt: timestamp,
    };

    // 1. Immediately update local storage
    const local = this.getLocalInstructors();
    const updatedLocal = local.map((inst) =>
      inst.id === id ? { ...inst, ...updateData } : inst
    );
    this.saveLocalInstructors(updatedLocal);

    if (db) {
      try {
        const userRef = doc(db, 'users', id);
        const instructorRef = doc(db, 'instructors', id);

        await setDoc(userRef, updateData, { merge: true }).catch((err) => {
          console.warn('[Admin Rejection] Firestore user doc write notice:', err.message);
        });
        await setDoc(instructorRef, updateData, { merge: true }).catch((err) => {
          console.warn('[Admin Rejection] Firestore instructor doc write notice:', err.message);
        });
        console.log(`[Admin Rejection] Rejected instructor UID: ${id} by Admin: ${adminUid}. Reason: ${reason}`);

        // Fetch instructor details from users collection to send SMTP mail
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            const name = data.name || data.fullName || 'Instructor';
            const email = data.email || '';

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
            }
          }
        } catch (smtpErr) {
          console.warn('Failed to send SMTP email:', smtpErr);
        }
      } catch (err) {
        console.warn('Failed to sync instructor rejection to Firestore:', err);
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
          fullName: instructor.name,
          email: instructor.email,
          specialty: instructor.specialty,
          department: instructor.specialty,
          status: instructor.status,
          approved: instructor.status === 'approved',
          assignedCourses: instructor.assignedCourses,
          updatedAt: new Date().toISOString(),
        };

        await updateDoc(doc(db, 'users', instructor.id), updateData);
      } catch (err) {
        console.warn('Firestore update instructor notice:', err);
      }
    }

    if (statusChanged) {
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
      } catch (err) {
        console.warn('Firestore delete instructor notice:', err);
      }
    }
  }
}

export const instructorService = new InstructorService();
