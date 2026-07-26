import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Check,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  X,
  Tag,
  HelpCircle,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Lock,
  ChevronDown,
  User,
  Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { discussionService } from '@/services/discussionService';
import type { DiscussionQuestion, DiscussionReply } from '@/services/discussionService';

interface DiscussionCenterProps {
  courseId: string;
  currentLessonId?: string;
  currentLessonName?: string;
  lessonsList?: Array<{ id: string; title: string }>;
  forceCreateOpen?: boolean;
  onCloseCreate?: () => void;
  onUnreadCountChange?: () => void;
}

export const DiscussionCenter: React.FC<DiscussionCenterProps> = ({
  courseId,
  currentLessonId,
  currentLessonName,
  lessonsList = [],
  forceCreateOpen = false,
  onCloseCreate,
  onUnreadCountChange,
}) => {
  const { userProfile, user } = useAuth();
  
  // Current user helper
  const currentUser = useMemo(() => {
    return {
      uid: userProfile?.uid || user?.uid || 'default_student',
      fullName: userProfile?.name || userProfile?.fullName || user?.displayName || 'Student User',
      photoURL: userProfile?.photoURL || user?.photoURL || '',
      role: userProfile?.role || 'student', // 'student' | 'instructor' | 'admin'
    };
  }, [userProfile, user]);

  const isInstructorOrAdmin = currentUser.role === 'instructor' || currentUser.role === 'admin';

  // State Management
  const [questions, setQuestions] = useState<DiscussionQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<DiscussionQuestion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  
  // Search, Filters, Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'answered' | 'closed' | 'my-questions' | 'unanswered'>('all');
  const [selectedSort, setSelectedSort] = useState<'latest' | 'oldest' | 'replies' | 'upvotes'>('latest');

  // Form states
  const [isCreating, setIsCreating] = useState(forceCreateOpen);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLessonId, setNewLessonId] = useState(currentLessonId || '');
  const [newTags, setNewTags] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reply states
  const [replyContent, setReplyContent] = useState('');
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showTabletFilters, setShowTabletFilters] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Popover menu for replies
  const [activeReplyMenuId, setActiveReplyMenuId] = useState<string | null>(null);

  // Reload discussions list
  const loadQuestions = () => {
    setIsLoading(true);
    // Simulate loading for high-fidelity skeleton feel
    setTimeout(() => {
      const qList = discussionService.getQuestions(courseId);
      setQuestions(qList);
      setIsLoading(false);
      if (onUnreadCountChange) {
        onUnreadCountChange();
      }
    }, 300);
  };

  useEffect(() => {
    loadQuestions();
    // Reset view states when course changes
    setSelectedQuestion(null);
    setReplies([]);
    setIsCreating(forceCreateOpen);
    setShowMobileDetail(false);
  }, [courseId, forceCreateOpen]);

  // Load replies when a question is selected
  useEffect(() => {
    if (selectedQuestion) {
      const rList = discussionService.getReplies(selectedQuestion.id);
      setReplies(rList);
      
      // Mark as read
      discussionService.markAsRead(courseId, selectedQuestion.id, currentUser.uid);
      if (onUnreadCountChange) {
        onUnreadCountChange();
      }
    }
  }, [selectedQuestion, courseId, currentUser.uid]);

  // Dynamic lesson list mapping if lessonsList isn't supplied
  const finalLessonsList = useMemo(() => {
    if (lessonsList && lessonsList.length > 0) {
      return lessonsList;
    }
    // Fallback based on Course ID
    if (courseId.includes('linux')) {
      return [
        { id: '101', title: '1.1 Intro to Unix & Linux Architecture' },
        { id: '102', title: '1.2 Shell Architecture & Anatomy' },
        { id: '103', title: '1.3 Navigating Files & Directories' },
        { id: '104', title: '1.4 Creating & Deleting Files' },
        { id: '201', title: '2.1 Linux File System Hierarchy Standard' },
        { id: '202', title: '2.2 File Permissions & Ownership (chmod 755)' },
        { id: '203', title: '2.3 User & Group Management' },
        { id: '204', title: '2.4 Text Search & Inspection (grep, cat)' },
        { id: '301', title: '3.1 Linux Process Lifecycles' },
        { id: '303', title: '3.3 Configuring Systemd Services' },
      ];
    }
    return [
      { id: 'git-les-101', title: '1.1 Introduction to Version Control' },
      { id: 'git-les-102', title: '1.2 Centralized vs Distributed VCS' },
      { id: 'git-les-103', title: '1.3 Why Git' },
      { id: 'git-les-104', title: '1.4 Why GitHub' },
      { id: 'git-les-105', title: '1.5 Installing Git' },
      { id: 'git-les-106', title: '1.6 Git Configuration' },
    ];
  }, [lessonsList, courseId]);

  // Search & Filter & Sort processing
  const filteredAndSortedQuestions = useMemo(() => {
    let list = [...questions];

    // Filter: Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          (item.lessonName && item.lessonName.toLowerCase().includes(q))
      );
    }

    // Filter: Status & Tab
    if (selectedFilter === 'open') {
      list = list.filter((item) => item.status === 'Open');
    } else if (selectedFilter === 'answered') {
      list = list.filter((item) => item.status === 'Answered');
    } else if (selectedFilter === 'closed') {
      list = list.filter((item) => item.status === 'Closed');
    } else if (selectedFilter === 'my-questions') {
      list = list.filter((item) => item.authorId === currentUser.uid);
    } else if (selectedFilter === 'unanswered') {
      list = list.filter((item) => item.repliesCount === 0);
    }

    // Sort
    if (selectedSort === 'latest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (selectedSort === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (selectedSort === 'replies') {
      list.sort((a, b) => b.repliesCount - a.repliesCount);
    } else if (selectedSort === 'upvotes') {
      list.sort((a, b) => b.upvotesCount - a.upvotesCount);
    }

    return list;
  }, [questions, searchQuery, selectedFilter, selectedSort, currentUser.uid]);

  // Handles adding a new question
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!newTitle.trim()) {
      setValidationError('Question Title is required.');
      return;
    }
    if (!newDescription.trim()) {
      setValidationError('Detailed Description is required.');
      return;
    }

    const selectedLessonObj = finalLessonsList.find((l) => l.id === newLessonId);
    const lessonName = selectedLessonObj?.title || currentLessonName || undefined;

    // Convert tag string to array
    const tagArray = newTags
      ? newTags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : [];

    const newQ = discussionService.addQuestion(
      courseId,
      newTitle,
      newDescription,
      newLessonId || undefined,
      lessonName,
      tagArray,
      currentUser
    );

    toast.success('New discussion question created successfully!');
    setQuestions([newQ, ...questions]);
    setSelectedQuestion(newQ);
    
    // Clear inputs
    setNewTitle('');
    setNewDescription('');
    setNewLessonId(currentLessonId || '');
    setNewTags('');
    setIsCreating(false);
    setShowMobileDetail(true);

    if (onCloseCreate) {
      onCloseCreate();
    }
    if (onUnreadCountChange) {
      onUnreadCountChange();
    }
  };

  // Handles Upvoting Question
  const handleUpvoteQuestion = (qId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = discussionService.toggleUpvoteQuestion(courseId, qId, currentUser.uid);
    if (updated) {
      setQuestions(questions.map((q) => (q.id === qId ? updated : q)));
      if (selectedQuestion && selectedQuestion.id === qId) {
        setSelectedQuestion(updated);
      }
    }
  };

  // Handles Upvoting Reply
  const handleUpvoteReply = (rId: string) => {
    if (!selectedQuestion) return;
    const updated = discussionService.toggleUpvoteReply(selectedQuestion.id, rId, currentUser.uid);
    if (updated) {
      setReplies(replies.map((r) => (r.id === rId ? updated : r)));
    }
  };

  // Adds a reply
  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    if (!replyContent.trim()) {
      toast.error('Reply content cannot be empty.');
      return;
    }

    const newReply = discussionService.addReply(courseId, selectedQuestion.id, replyContent, currentUser);
    toast.success('Reply posted successfully!');
    setReplies([...replies, newReply]);
    setReplyContent('');

    // Update repliesCount on selected question in list
    setQuestions(
      questions.map((q) =>
        q.id === selectedQuestion.id
          ? { ...q, repliesCount: q.repliesCount + 1, updatedAt: new Date().toISOString() }
          : q
      )
    );
    setSelectedQuestion({
      ...selectedQuestion,
      repliesCount: selectedQuestion.repliesCount + 1,
      updatedAt: new Date().toISOString(),
    });
  };

  // Edits a reply
  const handleEditReply = (rId: string) => {
    if (!selectedQuestion) return;
    if (!editingReplyContent.trim()) {
      toast.error('Reply content cannot be empty.');
      return;
    }

    const updated = discussionService.editReply(selectedQuestion.id, rId, editingReplyContent);
    if (updated) {
      setReplies(replies.map((r) => (r.id === rId ? updated : r)));
      toast.success('Reply updated.');
    }
    setEditingReplyId(null);
    setEditingReplyContent('');
  };

  // Deletes a reply
  const handleDeleteReply = (rId: string) => {
    if (!selectedQuestion) return;
    if (!window.confirm('Are you sure you want to delete your reply?')) return;

    discussionService.deleteReply(courseId, selectedQuestion.id, rId);
    setReplies(replies.filter((r) => r.id !== rId));
    toast.success('Reply deleted.');

    // Update counts
    const updatedCount = Math.max(0, selectedQuestion.repliesCount - 1);
    const isBestDeleted = selectedQuestion.bestAnswerReplyId === rId;
    
    const updatedQ = {
      ...selectedQuestion,
      repliesCount: updatedCount,
      bestAnswerReplyId: isBestDeleted ? null : selectedQuestion.bestAnswerReplyId,
      updatedAt: new Date().toISOString(),
    };

    setQuestions(questions.map((q) => (q.id === selectedQuestion.id ? updatedQ : q)));
    setSelectedQuestion(updatedQ);
  };

  // Marks a reply as Best Answer
  const handleMarkBestAnswer = (replyId: string | null) => {
    if (!selectedQuestion) return;
    if (!isInstructorOrAdmin) {
      toast.error('Only course instructors or admins can mark Best Answers.');
      return;
    }

    const updated = discussionService.markAsBestAnswer(courseId, selectedQuestion.id, replyId);
    if (updated) {
      setSelectedQuestion(updated);
      setQuestions(questions.map((q) => (q.id === selectedQuestion.id ? updated : q)));
      toast.success(replyId ? 'Marked as Best Answer! ✓' : 'Removed Best Answer.');
    }
  };

  // Closes or Reopens Discussion
  const handleToggleQuestionStatus = (status: 'Open' | 'Answered' | 'Closed') => {
    if (!selectedQuestion) return;
    if (!isInstructorOrAdmin && selectedQuestion.authorId !== currentUser.uid) {
      toast.error('Only instructors or the question author can modify status.');
      return;
    }

    const updated = discussionService.setQuestionStatus(courseId, selectedQuestion.id, status);
    if (updated) {
      setSelectedQuestion(updated);
      setQuestions(questions.map((q) => (q.id === selectedQuestion.id ? updated : q)));
      toast.success(`Discussion marked as ${status}.`);
    }
  };

  // Deletes Question
  const handleDeleteQuestion = (qId: string) => {
    if (!window.confirm('Are you sure you want to delete this discussion thread? This action cannot be undone.')) return;
    discussionService.deleteQuestion(courseId, qId);
    setQuestions(questions.filter((q) => q.id !== qId));
    setSelectedQuestion(null);
    setShowMobileDetail(false);
    toast.success('Discussion thread deleted.');
    if (onUnreadCountChange) {
      onUnreadCountChange();
    }
  };

  // Highlights user mentions visually
  const renderDescriptionWithMentions = (content: string) => {
    if (!content) return '';
    const parts = content.split(/(\@[a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="bg-indigo-50 border border-indigo-150 text-indigo-700 font-bold px-1.5 py-0.5 rounded-md text-[11px] inline-block align-baseline transition-all hover:scale-105 hover:bg-indigo-100"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Unread status checker for cards
  const isQuestionUnread = (question: DiscussionQuestion) => {
    const status = discussionService.getReadStatus(currentUser.uid);
    const lastRead = status[question.id];
    if (!lastRead) return true;
    return new Date(question.updatedAt).getTime() > new Date(lastRead).getTime();
  };

  // Helper for status badge rendering
  const renderStatusBadge = (status: 'Open' | 'Answered' | 'Closed') => {
    let classes = '';
    if (status === 'Open') {
      classes = 'bg-blue-50 border border-blue-200 text-blue-700';
    } else if (status === 'Answered') {
      classes = 'bg-emerald-50 border border-emerald-200 text-emerald-700';
    } else {
      classes = 'bg-slate-100 border border-slate-200 text-slate-700';
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide shrink-0 ${classes}`}>
        {status}
      </span>
    );
  };

  // Skeleton loading simulation
  const renderSkeletons = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div key={n} className="p-5 rounded-2xl border border-slate-200/60 bg-white/70 shadow-xs animate-pulse space-y-3">
          <div className="flex justify-between items-start gap-4">
            <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            <div className="h-4 bg-slate-200 rounded-full w-12 shrink-0" />
          </div>
          <div className="h-3 bg-slate-200 rounded-md w-1/3" />
          <div className="flex gap-2 pt-2">
            <div className="h-5 bg-slate-200 rounded-full w-14" />
            <div className="h-5 bg-slate-200 rounded-full w-16" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50 dark:bg-slate-900/10 p-1 rounded-3xl border border-sky-100/40 relative min-h-[550px] font-['Sora'] text-slate-800">
      
      {/* LEFT PANEL: QUESTION LIST (Grid Span 5 on Desktop) */}
      <div
        className={`lg:col-span-5 flex flex-col space-y-4 min-w-0 ${
          showMobileDetail && selectedQuestion ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Sticky Actions Bar */}
        <div className="sticky top-0 bg-white/90 border border-sky-150/40 p-4 rounded-2xl shadow-xs z-10 space-y-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>Discussion Board</span>
            </h2>
            
            <button
              onClick={() => {
                setIsCreating(true);
                setSelectedQuestion(null);
                setShowMobileDetail(true);
              }}
              className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/15 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ask Question</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions by title, description, tags, lesson..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-medium outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Trigger on Tablet / Mobile */}
          <div className="flex lg:hidden items-center justify-between gap-2.5">
            <button
              onClick={() => setShowTabletFilters(!showTabletFilters)}
              className="py-2 px-3.5 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter & Sort</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTabletFilters ? 'rotate-180' : ''}`} />
            </button>

            <span className="text-[11px] text-slate-500 font-medium bg-slate-100 py-1 px-2.5 rounded-lg border border-slate-200">
              {filteredAndSortedQuestions.length} matches
            </span>
          </div>

          {/* Inline filters on Desktop OR collapsed drawer on Tablet/Mobile */}
          <div className={`space-y-3 pt-2 border-t border-slate-100 ${showTabletFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Filter by Status</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'open', label: 'Open' },
                  { id: 'answered', label: 'Answered' },
                  { id: 'closed', label: 'Closed' },
                  { id: 'my-questions', label: 'My Questions' },
                  { id: 'unanswered', label: 'Unanswered' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id as any)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${
                      selectedFilter === f.id
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100/50 pt-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sort:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value as any)}
                  className="bg-transparent border-none text-[11px] font-bold text-slate-700 focus:ring-0 cursor-pointer pr-5 py-0 outline-none"
                >
                  <option value="latest">Latest Created</option>
                  <option value="oldest">Oldest Created</option>
                  <option value="replies">Most Replies</option>
                  <option value="upvotes">Most Upvoted</option>
                </select>
              </div>

              <span className="hidden lg:inline text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {filteredAndSortedQuestions.length} Threads
              </span>
            </div>
          </div>
        </div>

        {/* Discussion Card List */}
        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1.5 scrollbar-thin">
          {isLoading ? (
            renderSkeletons()
          ) : filteredAndSortedQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-slate-250 bg-white/50 text-slate-400 my-4">
              <Inbox className="w-10 h-10 text-slate-350 mb-3" />
              <h4 className="font-heading font-extrabold text-xs text-slate-800 uppercase tracking-wide">No discussions yet</h4>
              <p className="text-[11px] font-medium leading-relaxed text-slate-500 max-w-xs mt-1">
                Start the first conversation! Create a question or review active filter parameters.
              </p>
            </div>
          ) : (
            filteredAndSortedQuestions.map((q) => {
              const isSelected = selectedQuestion?.id === q.id;
              const isUnread = isQuestionUnread(q);
              
              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setIsCreating(false);
                    setShowMobileDetail(true);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-400 shadow-xs'
                      : 'bg-white border-slate-200/70 hover:border-slate-300'
                  }`}
                >
                  {/* Unread indicator dot */}
                  {isUnread && (
                    <span className="absolute left-2.5 top-5 w-2 h-2 rounded-full bg-blue-600 border border-white animate-pulse" />
                  )}

                  <div className="space-y-2.5 pl-2.5">
                    {/* Lesson tag and status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      {q.lessonName ? (
                        <span className="font-extrabold text-blue-800 bg-blue-50/70 border border-blue-100 rounded-md px-1.5 py-0.5 max-w-xs truncate" title={q.lessonName}>
                          📖 {q.lessonName}
                        </span>
                      ) : (
                        <span className="font-extrabold text-slate-500 bg-slate-100 rounded-md px-1.5 py-0.5">
                          Course General
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 shrink-0">
                        {renderStatusBadge(q.status)}
                      </div>
                    </div>

                    {/* Question title */}
                    <h3 className={`font-heading font-bold text-xs sm:text-sm leading-relaxed text-slate-900 ${isUnread ? 'font-extrabold' : ''}`}>
                      {q.title}
                    </h3>

                    {/* Description snippet */}
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {q.description}
                    </p>

                    {/* Tags List */}
                    {q.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {q.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer specs (Author, counts, dates) */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px] text-slate-500 font-semibold">
                      <div className="flex items-center gap-1.5">
                        {q.authorAvatar ? (
                          <img src={q.authorAvatar} alt={q.authorName} className="w-4 h-4 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                            <User className="w-2.5 h-2.5 text-slate-500" />
                          </div>
                        )}
                        <span className="truncate max-w-[90px]">{q.authorName}</span>
                        {q.authorRole === 'instructor' && (
                          <span className="bg-indigo-100 text-indigo-800 font-bold px-1.5 rounded-sm text-[8px] uppercase">
                            Staff
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={(e) => handleUpvoteQuestion(q.id, e)}
                          className={`flex items-center gap-1 hover:text-blue-600 transition-colors p-0.5 rounded-md cursor-pointer ${
                            q.upvotes.includes(currentUser.uid) ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{q.upvotesCount}</span>
                        </button>

                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-slate-400" />
                          <span>{q.repliesCount}</span>
                        </span>

                        <span>
                          {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: QUESTION DETAILED DETAIL OR CREATOR FORM (Grid Span 7 on Desktop) */}
      <div
        className={`lg:col-span-7 flex flex-col min-w-0 ${
          showMobileDetail && (selectedQuestion || isCreating) ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* ----------------- 1. CREATE DISCUSSIONS FORM ----------------- */}
        {isCreating ? (
          <div className="bg-white border border-sky-100 p-5 sm:p-6 rounded-3xl shadow-md space-y-5 animate-in slide-in-from-right-2 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setShowMobileDetail(false);
                    if (onCloseCreate) onCloseCreate();
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden cursor-pointer"
                >
                  <ArrowLeft className="w-4.5 h-4.5" />
                </button>
                <div>
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900">
                    Ask a New Question
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Post to the course community discussions.</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCreating(false);
                  setShowMobileDetail(false);
                  if (onCloseCreate) onCloseCreate();
                }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 text-xs rounded-xl flex items-center gap-2.5 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Question Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Be specific (e.g. 'chmod 755 doesn't grant write permission to group')"
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>

              {/* Related Lesson Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Related Lesson / Subtopic</label>
                <select
                  value={newLessonId}
                  onChange={(e) => setNewLessonId(e.target.value)}
                  className="w-full p-3 bg-slate-50 focus:bg-white text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-semibold"
                >
                  <option value="">-- General Discussion (No Lesson Association) --</option>
                  {finalLessonsList.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. permission, terminal, module2"
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-semibold"
                />
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Detailed Description *</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={6}
                  placeholder="Describe your doubt here. You can tag staff by typing @Instructor. Be sure to paste any error codes or terminal outputs to help others troubleshoot!"
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium leading-relaxed"
                />
              </div>

              {/* Visibility indicator */}
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold bg-slate-50 border border-slate-200/50 p-3.5 rounded-xl">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Visibility: <strong className="text-slate-700">Course Only</strong> (Only students and instructors of this track will view this thread).</span>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setShowMobileDetail(false);
                    if (onCloseCreate) onCloseCreate();
                  }}
                  className="py-2.5 px-4.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Post Discussion
                </button>
              </div>
            </form>
          </div>
        ) : selectedQuestion ? (
          // ----------------- 2. DETAILED DISCUSSION VIEW -----------------
          <div className="bg-white border border-sky-100 rounded-3xl shadow-md overflow-hidden flex flex-col max-h-[750px] animate-in slide-in-from-right-2 duration-200">
            
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between gap-3 z-10">
              <button
                onClick={() => {
                  setSelectedQuestion(null);
                  setShowMobileDetail(false);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden cursor-pointer"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>

              <div className="flex items-center gap-2">
                {renderStatusBadge(selectedQuestion.status)}
                
                {selectedQuestion.lessonName && (
                  <span className="hidden sm:inline text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-100 rounded-md truncate max-w-xs">
                    Lesson: {selectedQuestion.lessonName}
                  </span>
                )}
              </div>

              {/* Actions on discussion itself (instructors/admins, or creator if Open) */}
              <div className="flex items-center gap-2">
                {(isInstructorOrAdmin || selectedQuestion.authorId === currentUser.uid) && (
                  <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50/50">
                    <button
                      onClick={() => handleToggleQuestionStatus(selectedQuestion.status === 'Closed' ? 'Open' : 'Closed')}
                      className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer ${
                        selectedQuestion.status === 'Closed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/50'
                      }`}
                      title={selectedQuestion.status === 'Closed' ? 'Reopen Discussion' : 'Close Discussion'}
                    >
                      {selectedQuestion.status === 'Closed' ? 'Reopen Thread' : 'Close Thread'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                      className="p-1 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                      title="Delete Thread"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedQuestion(null);
                    setShowMobileDetail(false);
                  }}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Thread Details Container */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 scrollbar-thin">
              
              {/* Question original post */}
              <div className="space-y-4">
                <h2 className="font-heading font-extrabold text-base sm:text-lg leading-relaxed text-slate-900">
                  {selectedQuestion.title}
                </h2>

                {/* Author Card Info */}
                <div className="flex items-center justify-between border-b border-slate-100/50 pb-3">
                  <div className="flex items-center gap-3">
                    {selectedQuestion.authorAvatar ? (
                      <img src={selectedQuestion.authorAvatar} alt={selectedQuestion.authorName} className="w-9 h-9 rounded-full object-cover border border-slate-100" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-150 flex items-center justify-center border border-slate-200">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">{selectedQuestion.authorName}</span>
                        {selectedQuestion.authorRole === 'instructor' && (
                          <span className="bg-indigo-100 text-indigo-800 font-extrabold px-1.5 rounded-sm text-[8px] uppercase">
                            Instructor
                          </span>
                        )}
                        {selectedQuestion.authorRole === 'admin' && (
                          <span className="bg-rose-100 text-rose-800 font-extrabold px-1.5 rounded-sm text-[8px] uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        Posted on {new Date(selectedQuestion.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleUpvoteQuestion(selectedQuestion.id, e)}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      selectedQuestion.upvotes.includes(currentUser.uid)
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-extrabold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Upvoted ({selectedQuestion.upvotesCount})</span>
                  </button>
                </div>

                {/* Description content */}
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap pt-1.5">
                  {renderDescriptionWithMentions(selectedQuestion.description)}
                </div>

                {/* Tags */}
                {selectedQuestion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {selectedQuestion.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* REPLIES THREAD CONTAINER */}
              <div className="border-t border-slate-100 pt-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
                    Responses ({replies.length})
                  </h3>
                  {selectedQuestion.status === 'Closed' && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Thread is Locked
                    </span>
                  )}
                </div>

                {/* Best Answer highlight container */}
                {selectedQuestion.bestAnswerReplyId && (() => {
                  const best = replies.find((r) => r.id === selectedQuestion.bestAnswerReplyId);
                  if (!best) return null;
                  return (
                    <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 space-y-3.5 shadow-sm relative">
                      <div className="flex items-center justify-between text-emerald-800 border-b border-emerald-200/60 pb-2.5">
                        <span className="font-heading font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
                          <Check className="w-4.5 h-4.5 text-emerald-600 bg-emerald-100 p-0.5 rounded-full" />
                          <span>✓ Best Answer</span>
                        </span>
                        
                        {isInstructorOrAdmin && (
                          <button
                            onClick={() => handleMarkBestAnswer(null)}
                            className="text-[10px] font-bold text-slate-500 hover:text-rose-600 underline cursor-pointer"
                          >
                            Unmark Best Answer
                          </button>
                        )}
                      </div>

                      <div className="flex items-start gap-2.5 text-[11px] text-slate-500 font-semibold">
                        <img src={best.authorAvatar} alt={best.authorName} className="w-4 h-4 rounded-full object-cover shrink-0" />
                        <span>By {best.authorName} • Staff Recommended</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold italic">
                        "{best.content}"
                      </p>
                    </div>
                  );
                })()}

                {/* Responses List */}
                <div className="space-y-4 pt-1">
                  {replies.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-medium text-xs bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                      No replies yet. Be the first to answer this question!
                    </div>
                  ) : (
                    replies.map((reply) => {
                      const isBest = selectedQuestion.bestAnswerReplyId === reply.id;
                      const isOwnReply = reply.authorId === currentUser.uid;
                      const isEditing = editingReplyId === reply.id;
                      
                      return (
                        <div
                          key={reply.id}
                          className={`p-4 rounded-2xl border transition-all relative ${
                            isBest
                              ? 'bg-emerald-50/20 border-emerald-300 ring-2 ring-emerald-500/10'
                              : 'bg-white border-slate-100 shadow-2xs hover:shadow-xs'
                          }`}
                        >
                          {/* Thread Connector indicator */}
                          {isBest && (
                            <span className="absolute top-0 bottom-0 left-0 w-1 rounded-l-2xl bg-emerald-500" />
                          )}

                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              {/* Author and Date info */}
                              <div className="flex items-center gap-2.5">
                                {reply.authorAvatar ? (
                                  <img src={reply.authorAvatar} alt={reply.authorName} className="w-7 h-7 rounded-full object-cover border border-slate-100" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                    <User className="w-4 h-4 text-slate-400" />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold text-xs text-slate-900">{reply.authorName}</span>
                                    {reply.authorRole === 'instructor' && (
                                      <span className="bg-indigo-50 border border-indigo-150 text-indigo-800 font-bold px-1 py-0.2 rounded-sm text-[8px] uppercase">
                                        Staff
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[9px] text-slate-400 font-semibold block">
                                    {new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>

                              {/* Actions menu: best answer for instructors, edit/delete for author */}
                              <div className="flex items-center gap-1.5 shrink-0 relative">
                                {isInstructorOrAdmin && !isBest && (
                                  <button
                                    onClick={() => handleMarkBestAnswer(reply.id)}
                                    className="py-1 px-2 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 rounded-lg border border-emerald-100 text-[10px] font-extrabold flex items-center gap-0.5 transition-colors cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" /> Mark Best
                                  </button>
                                )}

                                {/* Context Menu Popover Toggle */}
                                {(isOwnReply || isInstructorOrAdmin) && (
                                  <div className="relative">
                                    <button
                                      onClick={() => setActiveReplyMenuId(activeReplyMenuId === reply.id ? null : reply.id)}
                                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                      <MoreVertical className="w-3.5 h-3.5" />
                                    </button>

                                    {activeReplyMenuId === reply.id && (
                                      <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20 w-32 animate-in fade-in duration-100">
                                        {isOwnReply && (
                                          <button
                                            onClick={() => {
                                              setEditingReplyId(reply.id);
                                              setEditingReplyContent(reply.content);
                                              setActiveReplyMenuId(null);
                                            }}
                                            className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold flex items-center gap-1.5 cursor-pointer"
                                          >
                                            <Edit2 className="w-3 h-3" /> Edit Reply
                                          </button>
                                        )}
                                        <button
                                          onClick={() => {
                                            handleDeleteReply(reply.id);
                                            setActiveReplyMenuId(null);
                                          }}
                                          className="w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold flex items-center gap-1.5 cursor-pointer border-t border-slate-100/55"
                                        >
                                          <Trash2 className="w-3 h-3" /> Delete Reply
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Reply message content or edit input */}
                            {isEditing ? (
                              <div className="space-y-2 pt-1 animate-in duration-100">
                                <textarea
                                  value={editingReplyContent}
                                  onChange={(e) => setEditingReplyContent(e.target.value)}
                                  rows={3}
                                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:border-blue-500 outline-none font-medium leading-relaxed"
                                />
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => setEditingReplyId(null)}
                                    className="py-1 px-3 border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 rounded-lg cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleEditReply(reply.id)}
                                    className="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-[10px] font-bold text-white rounded-lg cursor-pointer"
                                  >
                                    Save Edits
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pl-1.5">
                                {renderDescriptionWithMentions(reply.content)}
                              </p>
                            )}

                            {/* Reply Upvoting action */}
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => handleUpvoteReply(reply.id)}
                                className={`flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer p-1 rounded-md ${
                                  reply.upvotes.includes(currentUser.uid)
                                    ? 'text-blue-600 font-extrabold'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>Upvote ({reply.upvotesCount})</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Sticky Reply editor */}
            {selectedQuestion.status !== 'Closed' && (
              <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4">
                <form onSubmit={handleAddReply} className="flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a helpful response... Type @Instructor to tag staff."
                    className="flex-1 p-3 bg-slate-50 focus:bg-white text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-medium outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-4.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/10 cursor-pointer shrink-0 transition-all"
                  >
                    Reply
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          // ----------------- 3. SPLASH EMPTY DETAILED VIEW -----------------
          <div className="hidden lg:flex flex-col items-center justify-center bg-white border border-sky-100 p-12 rounded-3xl shadow-md h-full text-center text-slate-400">
            <HelpCircle className="w-14 h-14 text-slate-200 mb-4 animate-bounce" />
            <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-800 uppercase tracking-wide">
              Select a Thread
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-1 max-w-sm leading-relaxed">
              Choose a discussion thread from the left list to review detailed descriptions, ask questions, or contribute answers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
