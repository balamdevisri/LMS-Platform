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
import { LayoutGrid, List as ListIcon, Star, Flame, PlayCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

// ─── Quick Filter Tabs ───────────────────────────────────────────────────────
type QuickFilter = 'all' | 'recommended' | 'trending' | 'continue' | 'completed' | 'new';

const quickFilters: { id: QuickFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all',         label: 'All Courses',  icon: Sparkles     },
  { id: 'recommended', label: 'Recommended',  icon: Star         },
  { id: 'trending',    label: 'Trending',     icon: Flame        },
  { id: 'continue',    label: 'Continue',     icon: PlayCircle   },
  { id: 'completed',   label: 'Completed',    icon: CheckCircle2 },
  { id: 'new',         label: 'New',          icon: Sparkles     },
];
// ────────────────────────────────────────────────────────────────────────────

export const CoursesList: React.FC = () => {
  const { courses: contextCourses, refreshCourses } = useCourses();
  const { user } = useAuth();
  const activeUserId = user?.uid || 'default_student';

  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');

  const categories = ['All', 'Linux & Systems', 'AI & Data', 'DevOps', 'Development', 'Cybersecurity'];

  const applyQuickFilter = (list: ICourse[], filter: QuickFilter): ICourse[] => {
    if (filter === 'all') return list;

    if (filter === 'recommended') {
      return list.filter((c) => c.rating >= 4.5);
    }
    if (filter === 'trending') {
      return [...list].sort((a, b) => b.enrollmentCount - a.enrollmentCount);
    }
    if (filter === 'new') {
      return [...list].sort((a, b) => {
        const aDate = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
        const bDate = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
        return bDate - aDate;
      });
    }
    if (filter === 'continue') {
      return list.filter((c) => {
        const cp = courseService.getCourseCheckpoint(c.id, activeUserId);
        return cp && cp.progressPercent > 0 && cp.progressPercent < 100;
      });
    }
    if (filter === 'completed') {
      return list.filter((c) => {
        const cp = courseService.getCourseCheckpoint(c.id, activeUserId);
        return cp && cp.progressPercent >= 100;
      });
    }
    return list;
  };

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

      // 6. Apply quick filter (tab)
      list = applyQuickFilter(list, quickFilter);

      // 7. Paginate
      const limit = 6;
      const total = list.length;
      const totalPagesCalc = Math.ceil(total / limit) || 1;
      const paginated = list.slice((page - 1) * limit, page * limit);

      setCourses(paginated);
      setTotalPages(totalPagesCalc);
    } catch (err) {
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, [contextCourses, search, selectedCategory, selectedLevel, page, quickFilter, activeUserId]);

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
    setQuickFilter('all');
    setPage(1);
  };

  // Total non-paginated count for header badge
  const totalCourseCount = contextCourses.filter(
    (c) => (c.status || '').toLowerCase() === 'published'
  ).length;

  return (
    <div className="space-y-6 font-['Sora'] text-slate-900 dark:text-zinc-100 max-w-7xl mx-auto pb-16">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <CourseHeader
        title="My Courses"
        description="Continue where you left off, explore new tracks, or browse the full catalog."
        courseCount={totalCourseCount}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'My Courses' },
        ]}
      />

      {/* ── Quick Filter Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {quickFilters.map((f) => {
          const Icon = f.icon;
          const isActive = quickFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => { setQuickFilter(f.id); setPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 dark:hover:border-indigo-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── Search, Level, View Controls ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <LevelFilter selectedLevel={selectedLevel} onSelectLevel={(lvl) => { setSelectedLevel(lvl); setPage(1); }} />

            <div className="flex items-center gap-0.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
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

      {/* ── Course Grid / List / Empty ────────────────────────────────────────── */}
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
