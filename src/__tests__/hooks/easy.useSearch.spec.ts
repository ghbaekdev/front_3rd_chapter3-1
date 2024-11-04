import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const sampleEvents: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    description: '첫 번째 설명',
    date: '2024-11-01',
    location: '서울',
    startTime: '09:00',
    endTime: '10:00',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '이벤트 2',
    description: '두 번째 설명',
    date: '2024-11-02',
    location: '부산',
    startTime: '11:00',
    endTime: '12:00',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '3',
    title: '다른 행사',
    description: '33 2 관련',
    date: '2024-10-30',
    location: '대구',
    startTime: '13:00',
    endTime: '14:00',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
  {
    id: '4',
    title: '마지막 11',
    description: '설명',
    date: '2024-10-31',
    location: '인천',
    startTime: '15:00',
    endTime: '16:00',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(sampleEvents, new Date('2024-11-01'), 'week'));
  expect(result.current.filteredEvents).toHaveLength(sampleEvents.length);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(sampleEvents, new Date('2024-11-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('이벤트');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(sampleEvents, new Date('2024-11-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('설명');
  });

  expect(result.current.filteredEvents.length).toBeGreaterThan(0);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(sampleEvents, new Date('2024-11-01'), 'week'));

  expect(
    result.current.filteredEvents.every(
      (event) =>
        new Date(event.date) >= new Date('2024-10-30') &&
        new Date(event.date) <= new Date('2024-11-05')
    )
  ).toBe(true);
});

it('검색어를 변경하면 필터링된 결과가 즉시 업데이트되어야 한다', () => {
  const { result } = renderHook(() => useSearch(sampleEvents, new Date('2024-11-01'), 'week'));

  act(() => {
    result.current.setSearchTerm('이벤트');
  });
  expect(result.current.filteredEvents).toHaveLength(2);

  act(() => {
    result.current.setSearchTerm('행사');
  });
  expect(result.current.filteredEvents).toHaveLength(1);
});
