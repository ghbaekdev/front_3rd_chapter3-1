import { useState } from 'react';

import { Event } from '../types';

export function useOverlapDialog() {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const handleOverlap = (overlapping: Event[]) => {
    setOverlappingEvents(overlapping);
    setIsOverlapDialogOpen(true);
  };

  return {
    isOverlapDialogOpen,
    setIsOverlapDialogOpen,
    overlappingEvents,
    handleOverlap,
  };
}
