import { act, renderHook } from '@testing-library/react';

import { useOverlapDialog } from '../../hooks/useOverlapDialog';

describe('useOverlapDialog', () => {
  const mockEvents = [
    {
      id: '1',
      title: '이벤트 1',
      description: '첫 번째 설명 회의',
      date: '2024-11-01',
      location: '서울',
      startTime: '09:00',
      endTime: '10:00',
      category: '',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 0,
    },
  ];

  it('초기 상태값이 올바르게 설정되어야 합니다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('handleOverlap 함수가 상태를 올바르게 업데이트해야 합니다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.handleOverlap(mockEvents);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(mockEvents);
  });

  it('setIsOverlapDialogOpen으로 다이얼로그 상태를 변경할 수 있어야 합니다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.setIsOverlapDialogOpen(true);
    });
    expect(result.current.isOverlapDialogOpen).toBe(true);

    act(() => {
      result.current.setIsOverlapDialogOpen(false);
    });
    expect(result.current.isOverlapDialogOpen).toBe(false);
  });
});
