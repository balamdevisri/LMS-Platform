import { useState, useEffect } from 'react';
import { frontendLiveClassService } from '../services/liveClass.service';
import type { LiveClass } from '../types';

export const useLiveClasses = () => {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = frontendLiveClassService.subscribeLiveClasses((data) => {
      setClasses(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { classes, loading };
};

export const useLiveClassDetails = (classId: string) => {
  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    const unsubscribe = frontendLiveClassService.subscribeLiveClassById(classId, (data) => {
      setLiveClass(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [classId]);

  return { liveClass, loading };
};
