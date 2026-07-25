import React from 'react';

interface CourseThumbnailProps {
  src: string;
  alt: string;
  category?: string;
  className?: string;
  aspectRatio?: string;
}

export const CourseThumbnail: React.FC<CourseThumbnailProps> = ({
  src,
  alt,
  category,
  className = '',
  aspectRatio = 'aspect-video',
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl group ${aspectRatio} ${className}`}>
      <img
        src={src || '/assets/images/linux_course_thumbnail.png'}
        alt={alt}
        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
        }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
      {category && (
        <span className="absolute top-3 left-3 bg-indigo-900/80 backdrop-blur-md text-indigo-200 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
          {category}
        </span>
      )}
    </div>
  );
};
