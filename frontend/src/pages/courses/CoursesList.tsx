import React, { useState, useEffect, useCallback } from 'react';
import type { ICourse, CourseLevel } from '../../../../shared/types/course';
import { courseService } from '../../services/courseService';
import { useCourses } from '../../contexts/CourseContext';
import { CourseHeader } from '../../components/courses/CourseHeader';
import { CourseGrid } from '../../components/courses/CourseGrid';
import { CourseList } from '../../components/courses/CourseList';
import { CategoryFilter } from '../../components/courses/CategoryFilter';
import { LevelFilter } from '../../components/courses/LevelFilter';
import { SearchBar } from '../../components/courses/SearchBar';
import { Pagination } from '../../components/courses/Pagination';
import { EmptyState } from '../../components/courses/EmptyState';
import { LoadingSkeleton } from '../../components/courses/LoadingSkeleton';
import { LayoutGrid, List as ListIcon } from 'lucide-react';
import { toast } from 'sonner';

export const CoursesList: React.FC = () => {
  const { courses: contextCourses, refreshCourses } = useCourses();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ['All', 'Linux & Systems', 'AI & Data', 'DevOps', 'Development', 'Cybersecurity'];

  const fetchCourses = useCallback(() => {
    setLoading(true);
    try {
      // 1. Normalize all courses from context to ICourse
      let list = contextCourses.map((c) => courseService.normalizeCourseToICourse(c));

      // 2. Filter by status (published)
      list = list.filter((c) => c.status === 'published');

      // 3. Filter by category
      if (selectedCategory && selectedCategory !== 'All') {
        const selectedCat = selectedCategory.toLowerCase();
        list = list.filter((c) => {
          if (!c.category) return false;
          const courseCat = c.category.toLowerCase();
          return courseCat === selectedCat ||
                 (selectedCat.includes('development') && courseCat.includes('development')) ||
                 (selectedCat.includes('linux') && courseCat.includes('linux')) ||
                 (selectedCat.includes('sys') && courseCat.includes('sys'));
        });
      }

      // 4. Filter by level
      if (selectedLevel && selectedLevel !== 'all') {
        list = list.filter((c) => c.level === selectedLevel || c.level === 'all_levels');
      }

      // 5. Filter by search
      if (search) {
        const term = search.toLowerCase();
        list = list.filter(
          (c) =>
            c.title.toLowerCase().includes(term) ||
            (c.shortDescription && c.shortDescription.toLowerCase().includes(term)) ||
            (c.description && c.description.toLowerCase().includes(term)) ||
            c.category.toLowerCase().includes(term) ||
            (c.skills && c.skills.some((s) => s.toLowerCase().includes(term)))
        );
      }

      // 6. Paginate
      const limit = 6;
      const total = list.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginated = list.slice((page - 1) * limit, page * limit);

      setCourses(paginated);
      setTotalPages(totalPages);
    } catch (err) {
      toast.error('Failed to load course catalog.');
    } finally {
      setLoading(false);
    }
  }, [contextCourses, search, selectedCategory, selectedLevel, page]);

  useEffect(() => {
    refreshCourses();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleReset = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedLevel('all');
    setPage(1);
  };

  return (
    <div className="space-y-8 font-['Sora'] text-slate-900 max-w-7xl mx-auto pb-16">
      <CourseHeader
        title="Enterprise AI Technical Course Catalog"
        description="Explore hands-on technical tracks powered by live interactive Linux terminals and automated AI feedback."
        badgeText="Shaivika Course Tracks"
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Course Catalog' }]}
      />

      <div className="space-y-4 rounded-3xl bg-white border border-sky-100 p-6 shadow-md shadow-sky-100/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-96">
            <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <LevelFilter selectedLevel={selectedLevel} onSelectLevel={(lvl) => { setSelectedLevel(lvl); setPage(1); }} />

            <div className="flex items-center gap-1 p-1 rounded-xl bg-sky-50 border border-sky-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-sky-700'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-sky-700'
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => { setSelectedCategory(cat); setPage(1); }}
        />
      </div>

      {loading ? (
        <LoadingSkeleton count={6} />
      ) : courses.length === 0 ? (
        <EmptyState onReset={handleReset} />
      ) : (
        <div className="space-y-8">
          {viewMode === 'grid' ? (
            <CourseGrid courses={courses} />
          ) : (
            <CourseList courses={courses} />
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </div>
      )}
    </div>
  );
};
