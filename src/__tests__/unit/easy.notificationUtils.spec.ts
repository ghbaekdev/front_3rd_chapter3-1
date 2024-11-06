//notificationUtils
import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const baseEvent: Event = {
    id: '1',
    title: '미팅',
    date: '2024-03-20',
    startTime: '14:00',
    endTime: '15:00',
    notificationTime: 10,
    description: '팀 미팅',
    category: '',
    repeat: { type: 'none', interval: 0 },
    location: '',
  };

  const now = new Date('2024-03-20T13:50:00');

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events = [baseEvent];
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(baseEvent);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = [baseEvent];
    const notifiedEvents = [baseEvent.id];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const futureEvent = {
      ...baseEvent,
      id: '2',
      startTime: '15:00',
    };
    const events = [futureEvent];
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const pastEvent = {
      ...baseEvent,
      id: '3',
      startTime: '13:40',
    };
    const events = [pastEvent];
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '미팅',
      date: '2024-03-20',
      startTime: '14:00',
      endTime: '15:00',
      notificationTime: 30,
      description: '팀 미팅',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
    };

    const message = createNotificationMessage(event);
    expect(message).toBe('30분 후 미팅 일정이 시작됩니다.');
  });
});
