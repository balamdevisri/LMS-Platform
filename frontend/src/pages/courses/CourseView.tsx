import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useCourses } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import { courseService } from '@/services/courseService';
import { toast } from 'sonner';
import { CourseDetailsPage } from '@/components/learning/CourseDetailsPage';
import { InCourseLearningView } from '@/components/learning/InCourseLearningView';

export const CourseView: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const studentAvatar = userProfile?.photoURL || user?.photoURL || undefined;
  const studentName = userProfile?.name || user?.displayName || userProfile?.githubUsername || 'Bhanu Prakash Achari';
  const idOrSlug = courseId || slug || '1';
  const { getCourseById } = useCourses();
  const dynamicCourse = getCourseById(idOrSlug);

  const isGitCourse =
    idOrSlug === 'git-github-mastery-course-id' ||
    idOrSlug === 'git-github-mastery' ||
    dynamicCourse?.title?.toLowerCase().includes('git');

  const targetCourseId = String(dynamicCourse?.id || courseId || (isGitCourse ? 'git-github-mastery-course-id' : '1'));
  const userId = user?.uid || 'default_student';

  const [isEnrolled, setIsEnrolled] = useState<boolean>(() => {
    return courseService.isCourseEnrolled(targetCourseId, userId);
  });

  const initialMode = searchParams.get('mode') === 'learn';
  const [isLearningMode, setIsLearningMode] = useState(initialMode && isEnrolled);

  useEffect(() => {
    const enrolled = courseService.isCourseEnrolled(targetCourseId, userId);
    setIsEnrolled(enrolled);
  }, [targetCourseId, userId]);

  // Require student authentication & enrollment to enter learning mode
  useEffect(() => {
    if (initialMode) {
      if (!user) {
        setIsLearningMode(false);
        setSearchParams({});
        toast.warning('🔒 Please sign in as a student to access the learning environment!');
        navigate('/auth/login', { state: { from: location } });
      } else if (!isEnrolled) {
        setIsLearningMode(false);
        setSearchParams({});
        toast.warning('🔒 Enrollment required! Please click "Enroll in Course" to access lessons.');
      }
    }
  }, [initialMode, user, isEnrolled, navigate, location, setSearchParams]);

  const handleEnroll = async () => {
    if (!user) {
      toast.warning('🔒 Please sign in as a student to enroll in this course!');
      navigate('/auth/login', { state: { from: location } });
      return;
    }
    try {
      const res = await courseService.enrollCourse(targetCourseId, userId);
      if (res.success) {
        toast.success(`🎉 Enrolled in course! Learning workspace unlocked.`);
        setIsEnrolled(true);
        setIsLearningMode(true);
        setSearchParams({ mode: 'learn' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      toast.error('Failed to enroll in course.');
    }
  };

  const handleStartLearning = () => {
    if (!user) {
      toast.warning('🔒 Please sign in as a student to start learning this course!');
      navigate('/auth/login', { state: { from: location } });
      return;
    }
    if (!isEnrolled) {
      handleEnroll();
      return;
    }
    setIsLearningMode(true);
    setSearchParams({ mode: 'learn' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDetails = () => {
    setIsLearningMode(false);
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const linuxCourseData = {
    id: dynamicCourse?.id || courseId || '1',
    title: dynamicCourse?.title || 'Introduction to Linux & System Administration',
    subtitle: dynamicCourse?.subtitle || '🐧 Linux Essentials',
    instructor: dynamicCourse?.instructor || 'Bhanu Prakash Achari',
    role: dynamicCourse?.role || 'Linux Systems Architect & AI Specialist',
    avatar: dynamicCourse?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: dynamicCourse?.rating || 5.0,
    reviews: dynamicCourse?.reviews || 145,
    students: dynamicCourse?.students || '3',
    duration: dynamicCourse?.duration || '32 hrs',
    category: dynamicCourse?.category || 'Linux & Systems',
    level: dynamicCourse?.level || 'Beginner to Advanced',
    thumbnail: dynamicCourse?.thumbnail || '/assets/images/linux_course_thumbnail.png',
    introText: [
      `Welcome to Linux Essentials! Linux is one of the world's most powerful and widely used operating systems, powering everything from web servers and cloud platforms to Android devices, supercomputers, and embedded systems.`,
      `This course is designed for beginners who want to build a strong foundation in Linux. You will learn how Linux works, how to navigate the terminal, manage files and directories, understand permissions, and perform essential system operations using real-world commands.`,
      `By the end of this course, you'll have the confidence to work efficiently in any Linux environment and be prepared for advanced topics such as shell scripting, DevOps, cloud computing, and cybersecurity.`,
    ],
    outcomes: [
      'Master essential Linux CLI terminal navigation commands (cd, ls, pwd, find)',
      'Understand File System Hierarchy Standard (FHS) and directory structure',
      'Manage user accounts, groups, file permissions (chmod, chown) & umask',
      'Monitor processes, manage background jobs & configure Systemd services',
      'Write automated Bash shell scripts with variables, conditionals & loops',
      'Configure SSH hardening, Linux Firewall (UFW) and basic networking tools',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Linux Architecture, Kernel & CLI Fundamentals',
        duration: '8 Hours • 5 Lessons',
        lessons: [
          { id: 101, title: '1.1 Introduction to Unix & Linux Operating System Architecture', duration: '45 mins', type: 'video' },
          { id: 102, title: '1.2 Understanding Shell Architecture & Command Anatomy', duration: '60 mins', type: 'lab' },
          { id: 103, title: '1.3 Navigating Files & Directories (pwd, ls -la, cd, tree)', duration: '50 mins', type: 'lab' },
          { id: 104, title: '1.4 Creating, Copying, Moving & Deleting Files (mkdir, cp, mv, rm)', duration: '60 mins', type: 'lab' },
          { id: 105, title: '1.5 Quiz & Hands-on Terminal Practice: Module 1', duration: '30 mins', type: 'quiz' },
        ],
      },
      {
        id: 2,
        title: 'Module 2: File System Hierarchy, Permissions & Ownership',
        duration: '8 Hours • 5 Lessons',
        lessons: [
          { id: 201, title: '2.1 Linux File System Hierarchy Standard (/root, /etc, /var, /usr)', duration: '55 mins', type: 'video' },
          { id: 202, title: '2.2 File Permissions Demystified: Read, Write & Execute (chmod 755)', duration: '65 mins', type: 'lab' },
          { id: 203, title: '2.3 User & Group Management (chown, chgrp, useradd, sudo)', duration: '60 mins', type: 'lab' },
          { id: 204, title: '2.4 Text Search & Inspection Tools (cat, grep, head, tail, less)', duration: '70 mins', type: 'lab' },
          { id: 205, title: '2.5 Module 2 Practice Quiz', duration: '30 mins', type: 'quiz' },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Process Management, Systemd Services & Cron Jobs',
        duration: '8 Hours • 5 Lessons',
        lessons: [
          { id: 301, title: '3.1 Inspecting Active System Processes (top, htop, ps aux, kill)', duration: '60 mins', type: 'video' },
          { id: 302, title: '3.2 Controlling Daemon Services with Systemd (systemctl status/start)', duration: '75 mins', type: 'lab' },
          { id: 303, title: '3.3 Job Automation with Cron & Crontab Schedules', duration: '50 mins', type: 'lab' },
          { id: 304, title: '3.4 Monitoring System Logs with Journalctl', duration: '45 mins', type: 'lab' },
          { id: 305, title: '3.5 Module 3 Hands-on Assessment', duration: '40 mins', type: 'quiz' },
        ],
      },
      {
        id: 4,
        title: 'Module 4: Bash Scripting, Networking & Security Hardening',
        duration: '8 Hours • 5 Lessons',
        lessons: [
          { id: 401, title: '4.1 Writing Your First Bash Script: Shebang (#!/bin/bash) & Variables', duration: '80 mins', type: 'lab' },
          { id: 402, title: '4.2 Control Flow in Shell Scripts: If/Else Statements & Loops', duration: '90 mins', type: 'lab' },
          { id: 403, title: '4.3 Network Diagnostics (ping, netstat, ss, curl, ip addr)', duration: '60 mins', type: 'lab' },
          { id: 404, title: '4.4 SSH Key Pair Authentication & UFW Firewall Rules', duration: '70 mins', type: 'lab' },
          { id: 405, title: '4.5 Final Course Capstone Project & Certificate Exam', duration: '90 mins', type: 'quiz' },
        ],
      },
    ],
  };

  const gitCourseData = {
    id: 'git-github-mastery-course-id',
    title: 'Git & GitHub Mastery',
    subtitle: '🛠️ Git & GitHub Mastery',
    instructor: 'Admin',
    role: 'LMS Platform Systems Lead',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 180,
    students: '1,540',
    duration: '20 Hours',
    category: 'Development Tools',
    level: 'Beginner to Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80',
    introText: [
      `Welcome to Git & GitHub Mastery! Version control is a foundational skill for all developers. This course will take you from Git basics to advanced pipelines.`,
      `You will learn local repository initialization, stage-commit lifecycles, remote repository synchronization, pull requests, code reviews, rebasing, and automated pipelines using GitHub Actions.`,
      `By the end of this course, you will have a production-ready CI/CD setup and will earn your certification.`,
    ],
    outcomes: [
      'Configure Git globally and link local repositories to GitHub securely',
      'Create and merge branches, perform Pull Requests, and do collaborative code reviews',
      'Resolve complex merge conflicts and leverage stashing, rebasing, and cherry-picking',
      'Write custom GitHub Actions pipelines for automated testing & Netlify/Vercel deployments',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Version Control & Git Basics',
        duration: '3 Hours • 15 Lessons',
        lessons: [
          { id: 'git-les-101', title: '1.1 Introduction to Version Control', duration: '15 mins', type: 'reading' },
          { id: 'git-les-102', title: '1.2 Centralized vs Distributed Version Control', duration: '15 mins', type: 'reading' },
          { id: 'git-les-103', title: '1.3 Why Git', duration: '10 mins', type: 'reading' },
          { id: 'git-les-104', title: '1.4 Why GitHub', duration: '10 mins', type: 'reading' },
          { id: 'git-les-105', title: '1.5 Installing Git', duration: '20 mins', type: 'lab' },
          { id: 'git-les-106', title: '1.6 Git Configuration', duration: '15 mins', type: 'lab' },
          { id: 'git-les-107', title: '1.7 SSH Keys', duration: '20 mins', type: 'lab' },
          { id: 'git-les-108', title: '1.8 Personal Access Tokens', duration: '15 mins', type: 'reading' },
          { id: 'git-les-109', title: '1.9 git init', duration: '10 mins', type: 'lab' },
          { id: 'git-les-110', title: '1.10 Git Lifecycle', duration: '20 mins', type: 'reading' },
          { id: 'git-les-111', title: '1.11 git status', duration: '10 mins', type: 'lab' },
          { id: 'git-les-112', title: '1.12 git add', duration: '10 mins', type: 'lab' },
          { id: 'git-les-113', title: '1.13 git commit', duration: '15 mins', type: 'lab' },
          { id: 'git-les-114', title: '1.14 git log', duration: '10 mins', type: 'lab' },
          { id: 'git-les-115', title: '1.15 git diff', duration: '15 mins', type: 'lab' },
        ],
      },
      {
        id: 2,
        title: 'Module 2: GitHub Foundations',
        duration: '3 Hours • 16 Lessons',
        lessons: [
          { id: 'git-les-201', title: '2.1 Create Repository', duration: '10 mins', type: 'reading' },
          { id: 'git-les-202', title: '2.2 Remote Repository', duration: '10 mins', type: 'reading' },
          { id: 'git-les-203', title: '2.3 git remote add origin', duration: '10 mins', type: 'lab' },
          { id: 'git-les-204', title: '2.4 git push', duration: '15 mins', type: 'lab' },
          { id: 'git-les-205', title: '2.5 git pull', duration: '15 mins', type: 'lab' },
          { id: 'git-les-206', title: '2.6 git fetch', duration: '10 mins', type: 'lab' },
          { id: 'git-les-207', title: '2.7 git clone', duration: '15 mins', type: 'lab' },
          { id: 'git-les-208', title: '2.8 Git Branches', duration: '15 mins', type: 'reading' },
          { id: 'git-les-209', title: '2.9 git switch', duration: '10 mins', type: 'lab' },
          { id: 'git-les-210', title: '2.10 git checkout', duration: '10 mins', type: 'lab' },
          { id: 'git-les-211', title: '2.11 git merge', duration: '15 mins', type: 'lab' },
          { id: 'git-les-212', title: '2.12 Pull Requests', duration: '15 mins', type: 'reading' },
          { id: 'git-les-213', title: '2.13 Code Reviews', duration: '15 mins', type: 'reading' },
          { id: 'git-les-214', title: '2.14 Reviewers', duration: '10 mins', type: 'reading' },
          { id: 'git-les-215', title: '2.15 Labels', duration: '10 mins', type: 'reading' },
          { id: 'git-les-216', title: '2.16 Milestones', duration: '10 mins', type: 'reading' },
        ],
      },
    ],
  };

  const activeCourseData = {
    ...(isGitCourse ? gitCourseData : linuxCourseData),
    ...dynamicCourse,
    modules: (dynamicCourse?.modules && dynamicCourse.modules.length > 0)
      ? dynamicCourse.modules
      : (isGitCourse ? gitCourseData.modules : linuxCourseData.modules)
  };

  if (isLearningMode) {
    return (
      <InCourseLearningView
        courseTitle={activeCourseData.title}
        courseId={activeCourseData.id}
        modules={activeCourseData.modules}
        onBackToCourseDetails={handleBackToDetails}
        userAvatar={studentAvatar}
        userName={studentName}
      />
    );
  }

  return (
    <CourseDetailsPage
      course={activeCourseData}
      onStartLearning={handleStartLearning}
      isEnrolled={isEnrolled}
      onEnroll={handleEnroll}
    />
  );
};
