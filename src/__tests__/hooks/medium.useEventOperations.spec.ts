import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

const mockEvents: Event[] = [
  {
    id: '1',
    title: '테스트 이벤트 1',
    date: '2024-03-20',
    description: '테스트 이벤트 1 설명',
    location: '테스트 이벤트 1 위치',
    category: '테스트 이벤트 1 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
    startTime: '2024-03-20T09:00',
    endTime: '2024-03-20T10:00',
  },
  {
    id: '2',
    title: '테스트 이벤트 2',
    date: '2024-03-21',
    description: '테스트 이벤트 2 설명',
    location: '테스트 이벤트 2 위치',
    category: '테스트 이벤트 2 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
    startTime: '2024-03-21T14:00',
    endTime: '2024-03-21T15:00',
  },
];

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    })
  );

  const { result } = renderHook(() => useEventOperations(false, () => {}));

  await waitFor(() => {
    expect(result.current.events).toEqual(mockEvents);
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation();

  const newEvent: EventForm = {
    title: '새 이벤트',
    date: '2024-03-22',
    startTime: '2024-03-22T10:00',
    endTime: '2024-03-22T11:00',
    description: '새로운 이벤트입니다',
    location: '회의실 A',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const { result } = renderHook(() => useEventOperations(false, () => {}));

  await act(async () => {
    await result.current.saveEvent(newEvent as EventForm);
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 추가되었습니다.',
      status: 'success',
    })
  );
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const updatedEvent: Event = {
    id: '1',
    title: '수정된 이벤트',
    date: '2024-03-20',
    startTime: '2024-03-20T09:00',
    endTime: '2024-03-20T12:00',
    description: '수정된 이벤트입니다',
    location: '회의실 B',
    category: '미팅',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  };

  const { result } = renderHook(() => useEventOperations(true, () => {}));

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 수정되었습니다.',
      status: 'success',
    })
  );
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false, () => {}));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 삭제되었습니다.',
      status: 'info',
    })
  );
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  renderHook(() => useEventOperations(false, () => {}));

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
      })
    );
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const nonExistentEvent: Event = {
    id: '999',
    title: '존재하지 않는 이벤트',
    date: '2024-03-20',
    startTime: '2024-03-20T09:00',
    endTime: '2024-03-20T10:00',
    description: '존재하지 않는 이벤트입니다',
    location: '알 수 없음',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  server.use(
    http.put('/api/events/999', () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  const { result } = renderHook(() => useEventOperations(true, () => {}));

  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 저장 실패',
      status: 'error',
    })
  );
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/1', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false, () => {}));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 삭제 실패',
      status: 'error',
    })
  );
});
