import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StudentRoute } from '@/components/auth/StudentRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';

// Helper to lazy load named exports and wrap them in a Suspense boundary
const lazyLoad = (importFn: () => Promise<any>, name: string) => {
  const LazyComponent = lazy(() => importFn().then((m) => ({ default: m[name] })));
  const SuspenseWrapper = (props: any) => (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
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


const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'courses', element: <CoursesList /> },
      { path: 'course/:slug', element: <CourseView /> },
      { path: 'courses/:courseId', element: <CourseView /> },
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
  // Student Protected Routes (/dashboard, /courses, /profile)
  {
    path: '/',
    element: (
      <StudentRoute>
        <DashboardLayout />
      </StudentRoute>
    ),
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'dashboard/practice-lab', element: <PracticeLabPage /> },
      { path: 'dashboard/sandbox', element: <PracticeLabPage /> },
      { path: 'dashboard/courses', element: <CoursesList /> },
      { path: 'dashboard/course/:slug', element: <CourseView /> },
      { path: 'dashboard/courses/:courseId', element: <CourseView /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
  // Admin Protected Routes (/admin/dashboard, /admin/users, /admin/users/:id, /admin/courses, /admin/students, /admin/instructors)
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <DashboardLayout />
      </AdminRoute>
    ),
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'courses', element: <Courses /> },
      { path: 'courses/create', element: <AdminCourseCreate /> },
      { path: 'courses/:id/edit', element: <AdminCourseEdit /> },
      { path: 'courses/edit/:id', element: <AdminCourseEdit /> },
      { path: 'courses/:courseId', element: <AdminCourseDetails /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'users/:id', element: <AdminUserProfile /> },
      { path: 'students', element: <AdminStudents /> },
      { path: 'instructors', element: <AdminInstructors /> },
      { path: 'content', element: <AdminContentManagement /> },
      { path: 'content-management', element: <AdminContentManagement /> },
      { path: 'analytics', element: <div className="p-8 bg-white border border-sky-100 rounded-3xl shadow-xs"><h1 className="font-heading font-extrabold text-2xl text-slate-900">Analytics</h1><p className="text-slate-500 mt-2">Kaizen Q analytics and reporting features are coming soon.</p></div> },
      { path: 'settings', element: <div className="p-8 bg-white border border-sky-100 rounded-3xl shadow-xs"><h1 className="font-heading font-extrabold text-2xl text-slate-900">Settings</h1><p className="text-slate-500 mt-2">Kaizen Q administrative and configuration settings are coming soon.</p></div> },
    ],
  },
  // Fallback 404 / Unauthorized redirect
  {
    path: '*',
    element: <Unauthorized />,
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
