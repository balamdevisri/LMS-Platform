import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StudentRoute } from '@/components/auth/StudentRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Helper to lazy load named exports and wrap them in a Suspense boundary
const lazyLoad = (importFn: () => Promise<any>, name: string) => {
  const LazyComponent = lazy(async () => {
    try {
      const module = await importFn();
      // Clear flag on successful load
      sessionStorage.removeItem(`chunk_failed_${name}`);
      return { default: module[name] };
    } catch (error: any) {
      console.error(`Error loading component ${name}:`, error);
      const isChunkError = 
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Importing a module script failed');
        
      if (isChunkError) {
        const chunkFailedKey = `chunk_failed_${name}`;
        if (!sessionStorage.getItem(chunkFailedKey)) {
          sessionStorage.setItem(chunkFailedKey, 'true');
          window.location.reload();
          // Return a dummy component while page reloads to prevent React crash
          return { default: () => null };
        }
      }
      throw error;
    }
  });
  const SuspenseWrapper = (props: any) => (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <LazyComponent {...props} />
    </Suspense>
  );
  SuspenseWrapper.displayName = `Lazy(${name})`;
  return SuspenseWrapper;
};

// Lazy loaded page components
const LandingPage = lazyLoad(() => import('@/pages/LandingPage'), 'LandingPage');
const Login = lazyLoad(() => import('@/pages/auth/Login'), 'Login');
const Register = lazyLoad(() => import('@/pages/auth/Register'), 'Register');
const StudentSignup = lazyLoad(() => import('@/pages/StudentSignup'), 'StudentSignup');
const ForgotPassword = lazyLoad(() => import('@/pages/auth/ForgotPassword'), 'ForgotPassword');
const VerifyEmail = lazyLoad(() => import('@/pages/auth/VerifyEmail'), 'VerifyEmail');
const Unauthorized = lazyLoad(() => import('@/pages/auth/Unauthorized'), 'Unauthorized');
const Dashboard = lazyLoad(() => import('@/pages/dashboard/Dashboard'), 'Dashboard');
const PracticeLabPage = lazyLoad(() => import('@/pages/dashboard/PracticeLabPage'), 'PracticeLabPage');
const LeaderboardPage = lazyLoad(() => import('@/pages/dashboard/LeaderboardPage'), 'LeaderboardPage');
const Profile = lazyLoad(() => import('@/pages/dashboard/Profile'), 'Profile');
const CoursesList = lazyLoad(() => import('@/pages/courses/CoursesList'), 'CoursesList');
const CourseView = lazyLoad(() => import('@/pages/courses/CourseView'), 'CourseView');
const AdminDashboard = lazyLoad(() => import('@/pages/admin/AdminDashboard'), 'AdminDashboard');
const Courses = lazyLoad(() => import('@/pages/admin/Courses'), 'Courses');
const AdminCourseCreate = lazyLoad(() => import('@/pages/admin/AdminCourseCreate'), 'AdminCourseCreate');
const AdminCourseEdit = lazyLoad(() => import('@/pages/admin/AdminCourseEdit'), 'AdminCourseEdit');
const AdminStudents = lazyLoad(() => import('@/pages/admin/AdminStudents'), 'AdminStudents');
const AdminInstructors = lazyLoad(() => import('@/pages/admin/AdminInstructors'), 'AdminInstructors');
const AdminUsers = lazyLoad(() => import('@/pages/admin/AdminUsers'), 'AdminUsers');
const AdminUserProfile = lazyLoad(() => import('@/pages/admin/AdminUserProfile'), 'AdminUserProfile');
const AdminCourseDetails = lazyLoad(() => import('@/pages/admin/AdminCourseDetails'), 'AdminCourseDetails');
const AdminContentManagement = lazyLoad(() => import('@/pages/admin/AdminContentManagement'), 'AdminContentManagement');
const LiveClassroomDashboard = lazyLoad(() => import('@/pages/liveClassroom/LiveClassroomDashboard'), 'LiveClassroomDashboard');
const AdminLiveClassroom = lazyLoad(() => import('@/pages/liveClassroom/AdminLiveClassroom'), 'AdminLiveClassroom');
const LiveClassroomScreen = lazyLoad(() => import('@/pages/liveClassroom/LiveClassroomScreen'), 'LiveClassroomScreen');
const MentorAnalytics = lazyLoad(() => import('@/pages/liveClassroom/MentorAnalytics'), 'MentorAnalytics');
const VerifyCertificate = lazyLoad(() => import('@/pages/certificates/VerifyCertificate'), 'VerifyCertificate');
const PublicPortfolio = lazyLoad(() => import('@/pages/portfolio/PublicPortfolio'), 'PublicPortfolio');
const LiveClassPage = lazyLoad(() => import('@/pages/liveClass/LiveClassPage'), 'LiveClassPage');
const AdminLiveClassList = lazyLoad(() => import('@/pages/liveClassroom/AdminLiveClassList'), 'AdminLiveClassList');
const AdminCreateLiveClass = lazyLoad(() => import('@/pages/liveClassroom/AdminCreateLiveClass'), 'AdminCreateLiveClass');
const AdminLiveControlCenter = lazyLoad(() => import('@/pages/liveClassroom/AdminLiveControlCenter'), 'AdminLiveControlCenter');

// ─── Simple placeholder pages for coming-soon admin sections ─────────────────
const PlaceholderPage = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 py-16 text-center">
    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl">
      📊
    </div>
    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">{title}</h1>
    <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm">{subtitle}</p>
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-bold">
      Coming Soon
    </span>
  </div>
);
// ─────────────────────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'courses', element: <CoursesList /> },
      { path: 'course/:slug', element: <CourseView /> },
      { path: 'verify-certificate', element: <VerifyCertificate /> },
      { path: 'verify-certificate/:verificationId', element: <VerifyCertificate /> },
      { path: 'portfolio/:handleOrId', element: <PublicPortfolio /> },
      { path: 'unauthorized', element: <Unauthorized /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'signup', element: <StudentSignup /> },
      { path: 'student-signup', element: <StudentSignup /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'verify-email', element: <VerifyEmail /> },
    ],
  },
  // Shared Authenticated Routes (Profile, etc.)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'profile', element: <Profile /> },
    ],
  },
  // Student Protected Routes
  {
    path: '/',
    element: (
      <StudentRoute>
        <DashboardLayout />
      </StudentRoute>
    ),
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'dashboard/leaderboard', element: <LeaderboardPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'dashboard/practice-lab', element: <PracticeLabPage /> },
      { path: 'dashboard/courses', element: <CoursesList /> },
      { path: 'dashboard/course/:slug', element: <CourseView /> },
      { path: 'dashboard/live-classroom', element: <LiveClassroomDashboard /> },
      { path: 'dashboard/live-class/:liveClassId', element: <LiveClassPage /> },
    ],
  },
  // Instructor & Admin Shared Management Routes
  {
    path: '/admin',
    element: (
      <AdminRoute allowInstructor={true}>
        <DashboardLayout />
      </AdminRoute>
    ),
    children: [
      { path: 'courses', element: <Courses /> },
      { path: 'courses/create', element: <AdminCourseCreate /> },
      { path: 'courses/:id/edit', element: <AdminCourseEdit /> },
      { path: 'courses/edit/:id', element: <AdminCourseEdit /> },
      { path: 'courses/:courseId', element: <AdminCourseDetails /> },
      { path: 'students', element: <AdminStudents /> },
      { path: 'content', element: <AdminContentManagement /> },
      { path: 'content-management', element: <AdminContentManagement /> },
      { path: 'live-classroom', element: <LiveClassroomDashboard /> },
      { path: 'live-classes', element: <AdminLiveClassList /> },
      { path: 'live-classes/create', element: <AdminCreateLiveClass /> },
      { path: 'live-classes/:id/edit', element: <AdminCreateLiveClass /> },
      { path: 'live-classes/:id/control', element: <AdminLiveControlCenter /> },
      { path: 'live-control-panel', element: <AdminLiveClassroom /> },
      { path: 'live-classroom/control-panel', element: <AdminLiveClassroom /> },
      { path: 'live-classroom/mentor-analytics', element: <MentorAnalytics /> },
    ],
  },
  // Strict Admin Only Protected Routes
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <DashboardLayout />
      </AdminRoute>
    ),
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'live-classroom/control-panel', element: <AdminLiveClassroom /> },
      { path: 'live-control-panel', element: <AdminLiveClassroom /> },
      { path: 'live-classroom/studio', element: <LiveClassroomDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'users/:id', element: <AdminUserProfile /> },
      { path: 'instructors', element: <AdminInstructors /> },
      {
        path: 'analytics',
        element: <PlaceholderPage title="Analytics" subtitle="Platform analytics, student progress reports, and engagement metrics are coming soon." />,
      },
      {
        path: 'settings',
        element: <PlaceholderPage title="Settings" subtitle="Administrative configuration, platform settings, and preferences are coming soon." />,
      },
    ],
  },
  // Dedicated Full-screen Protected Live Classroom routes
  {
    path: '/student/live-class/:liveClassId',
    element: (
      <ProtectedRoute>
        <LiveClassPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/live-class/:liveClassId',
    element: (
      <ProtectedRoute>
        <LiveClassPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/live-classroom/room/:classId',
    element: (
      <ProtectedRoute>
        <LiveClassroomScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: '/live-classroom/:classId',
    element: (
      <ProtectedRoute>
        <LiveClassroomScreen />
      </ProtectedRoute>
    ),
  },
  // Fallback 404
  {
    path: '*',
    element: <Unauthorized />,
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
