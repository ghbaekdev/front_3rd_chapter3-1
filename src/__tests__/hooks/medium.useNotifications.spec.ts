import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const mockEvent: Event = {
  id: '1',
  title: '기존 회의',
  date: '2024-10-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '기존 팀 미팅',
  location: '회의실 B',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

const mockIntervalCallback = vi.fn();

vi.mock('@chakra-ui/react', () => ({
  useInterval: (callback: () => void) => {
    mockIntervalCallback.mockImplementation(callback);
  },
}));

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));

  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트 1',
      date: formatDate(new Date('2024-10-15')),
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 이벤트 1 설명',
      location: '테스트 이벤트 1 위치',
      category: '테스트 이벤트 1 카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications([]));

  act(() => {
    result.current.setNotifications([
      { id: '1', message: '알림 1' },
      { id: '2', message: '알림 2' },
    ]);
  });

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toEqual([{ id: '2', message: '알림 2' }]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const now = new Date();
  const eventTime = new Date(now.getTime() + 10 * 60 * 1000);

  const testEvent: Event = {
    ...mockEvent,
    id: '1',
    date: formatDate(eventTime),
    startTime: parseHM(eventTime.getTime()),
    endTime: parseHM(eventTime.getTime() + 60 * 60 * 1000),
  };

  const { result } = renderHook(() => useNotifications([testEvent]));

  act(() => {
    mockIntervalCallback();
  });

  expect(result.current.notifications).toHaveLength(1);
  const firstNotificationCount = result.current.notifications.length;

  act(() => {
    mockIntervalCallback();
  });

  expect(result.current.notifications).toHaveLength(firstNotificationCount);
  expect(result.current.notifiedEvents).toContain('1');
});
