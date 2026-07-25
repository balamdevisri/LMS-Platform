import React, { useState } from 'react';
import { BookOpen, Plus, Sparkles, BookCheck, FileEdit, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useCourses } from '@/contexts/CourseContext';
import CourseStatsCard from '@/components/admin/courses/CourseStatsCard';
import CourseSearchBar from '@/components/admin/courses/CourseSearchBar';
import CourseFilters from '@/components/admin/courses/CourseFilters';
import CourseTable from '@/components/admin/courses/CourseTable';
import EmptyCourses from '@/components/admin/courses/EmptyCourses';

export const Courses: React.FC = () => {
  const { courses, toggleCourseStatus, deleteCourse } = useCourses();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Newest');

  // Dynamic filter dropdown options based on current database courses
  const categories = Array.from(new Set(courses.map((c) => c.category).filter((c): c is string => !!c)));
  const levels = Array.from(new Set(courses.map((c) => c.level).filter((l): l is string => !!l)));

  // Calculate statistics
  const totalCourses = courses.length;
  const publishedCoursesCount = courses.filter((c) => c.status === 'Published').length;
  const draftCoursesCount = courses.filter((c) => c.status === 'Draft').length;

  const totalStudentsEnrolled = courses.reduce((sum, c) => {
    const parsed = parseInt(String(c.students).replace(/,/g, '')) || 0;
    return sum + parsed;
  }, 0);

  // Filter & Sort Logic
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    const matchesStatus = selectedStatus === 'All' || course.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (selectedSort === 'Title A-Z') {
      return a.title.localeCompare(b.title);
    }
    if (selectedSort === 'Most Students') {
      const countA = parseInt(String(a.students).replace(/,/g, '')) || 0;
      const countB = parseInt(String(b.students).replace(/,/g, '')) || 0;
      return countB - countA;
    }
    
    // Sort by Newest / Oldest
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (selectedSort === 'Oldest') {
      return dateA - dateB;
    }
    // Default: Newest
    return dateB - dateA;
  });

  // Action Handlers
  const handleCreateCourseClick = () => {
    toast.info('Create Course Form feature is under development.');
  };

  const handleView = (course: any) => {
    window.open(`/courses/${course.id}`, '_blank');
  };

  const handleEdit = (course: any) => {
    toast.info(`Edit Course Form for "${course.title}" is under development.`);
  };

  const handleTogglePublish = async (course: any) => {
    const newStatus = course.status === 'Published' ? 'Draft' : 'Published';
    try {
      await toggleCourseStatus(course.id);
      toast.success(`Course "${course.title}" set to ${newStatus}!`);
    } catch {
      toast.error('Failed to update course status.');
    }
  };

  const handleDelete = async (course: any) => {
    if (window.confirm(`Are you sure you want to delete the course: "${course.title}"? This action cannot be undone.`)) {
      try {
        await deleteCourse(course.id);
        toast.success(`Course "${course.title}" deleted successfully.`);
      } catch {
        toast.error('Failed to delete course.');
      }
    }
  };

  return (
    <div className="space-y-8 text-slate-900 max-w-7xl mx-auto pb-12 font-['Sora']">
      
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-2xl border border-sky-100 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-[10px] font-bold uppercase tracking-wider mb-2 select-none">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Kaizen Q Portal</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Course Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Create, edit, publish and manage all learning courses.
          </p>
        </div>

        <button
          onClick={handleCreateCourseClick}
          className="btn-blue-primary text-xs py-3.5 px-6 shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Course</span>
        </button>
      </div>

      {/* Course Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CourseStatsCard
          title="Total Courses"
          value={totalCourses}
          icon={BookOpen}
          color="blue"
        />
        <CourseStatsCard
          title="Published Courses"
          value={publishedCoursesCount}
          icon={BookCheck}
          color="green"
        />
        <CourseStatsCard
          title="Draft Courses"
          value={draftCoursesCount}
          icon={FileEdit}
          color="amber"
        />
        <CourseStatsCard
          title="Students Enrolled"
          value={totalStudentsEnrolled.toLocaleString()}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Main Table & Filter Controls Container */}
      {courses.length === 0 ? (
        <EmptyCourses onCreateCourse={handleCreateCourseClick} />
      ) : (
        <div className="bg-white/90 border border-sky-100 rounded-3xl p-6 space-y-6 shadow-2xs">
          
          {/* Search bar & filter controls */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <h2 className="font-heading font-extrabold text-lg text-slate-900 select-none">
                All Courses ({filteredCourses.length})
              </h2>
              <CourseSearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            
            <CourseFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
              categories={categories}
              levels={levels}
            />
          </div>

          {/* Courses Table View */}
          {sortedCourses.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-sky-100 rounded-2xl bg-slate-50/50">
              <p className="text-slate-500 font-semibold text-sm">No courses match your filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedLevel('All');
                  setSelectedStatus('All');
                }}
                className="text-xs text-sky-600 hover:text-sky-800 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <CourseTable
              courses={sortedCourses}
              onView={handleView}
              onEdit={handleEdit}
              onTogglePublish={handleTogglePublish}
              onDelete={handleDelete}
            />
          )}

        </div>
      )}

    </div>
  );
};

export default Courses;
