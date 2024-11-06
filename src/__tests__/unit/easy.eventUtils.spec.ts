import { Event } from '../../types';
import { filterEventsByDateRange, getFilteredEvents, searchEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const sampleEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      description: '첫 번째 설명',
      date: '2024-07-01',
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
      date: '2024-07-03',
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
      description: '이벤트 2 관련',
      date: '2024-07-15',
      location: '대구',
      startTime: '13:00',
      endTime: '14:00',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '4',
      title: '마지막 이벤트',
      description: '설명',
      date: '2024-06-30',
      location: '인천',
      startTime: '15:00',
      endTime: '16:00',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = searchEvents(sampleEvents, '이벤트 2');
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(['2', '3']);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const result = filterEventsByDateRange(
      sampleEvents,
      new Date('2024-07-01'),
      new Date('2024-07-07')
    );
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(sampleEvents, '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(sampleEvents, '이벤트', new Date('2024-07-01'), 'week');
    console.log('result', result);
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.id)).toEqual(['1', '2', '4']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(sampleEvents, '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const eventsWithMixedCase: Event[] = [
      {
        id: '1',
        title: 'EVENT 대문자',
        description: '설명',
        date: '2024-11-01',
        location: '서울',
        startTime: '09:00',
        endTime: '10:00',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const result = searchEvents(eventsWithMixedCase, 'event');

    expect(result).toHaveLength(1);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(sampleEvents, '', new Date('2024-06-30'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('4');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date(), 'week');
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
