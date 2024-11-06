import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
};

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    const newEvent = {
      title: '팀 회의**',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '프로젝트 진행상황 공유',
      location: '회의실 A',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    const events = screen.getByTestId('event-list');
    expect(within(events).getByText(newEvent.title)).toBeInTheDocument();
    expect(within(events).getByText(newEvent.date)).toBeInTheDocument();
    expect(
      within(events).getByText(`${newEvent.startTime} - ${newEvent.endTime}`)
    ).toBeInTheDocument();
    expect(within(events).getByText(newEvent.description)).toBeInTheDocument();
    expect(within(events).getByText(newEvent.location)).toBeInTheDocument();
    expect(within(events).getByText(`카테고리: ${newEvent.category}`)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    console.log('11', screen.getByLabelText('Edit event'));
    await user.click(screen.getAllByLabelText('Edit event')[0]);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '수정된 설명');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('수정된 회의')).toBeInTheDocument();
    expect(screen.getByText('수정된 설명')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    const eventTitle = '삭제할 이벤트';
    expect(screen.getByText(eventTitle)).toBeInTheDocument();

    await user.click(screen.getAllByLabelText('Delete event')[0]);

    expect(screen.queryByText(eventTitle)).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // setupMockHandlerCreation([]);
    // const { user } = setup(<App />);
    // // 주별 뷰 선택
    // await user.selectOptions(screen.getByLabelText('view'), 'week');
    // const weekView = screen.getByTestId('week-view');
    // expect(weekView).toBeInTheDocument();
    // expect(screen.queryByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // const testEvent = {
    //   id: '1',
    //   title: '테스트 회의',
    //   date: '2024-10-01',
    //   startTime: '09:00',
    //   endTime: '10:00',
    //   description: '테스트',
    //   location: '회의실',
    //   category: '업무',
    //   repeat: { type: 'none', interval: 0 },
    //   notificationTime: 10,
    // };
    // setupMockHandlerCreation([testEvent]);
    // const { user } = setup(<App />);
    // await user.selectOptions(screen.getByLabelText('view'), 'week');
    // expect(screen.getByText(testEvent.title)).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    // setupMockHandlerCreation([]);
    // const { user } = setup(<App />);
    // await user.selectOptions(screen.getByLabelText('view'), 'month');
    // const monthView = screen.getByTestId('month-view');
    // expect(monthView).toBeInTheDocument();
    // expect(screen.queryByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    // const testEvent = {
    //   id: '1',
    //   title: '월간 회의',
    //   date: '2024-10-15',
    //   startTime: '09:00',
    //   endTime: '10:00',
    //   description: '테스트',
    //   location: '회의실',
    //   category: '업무',
    //   repeat: { type: 'none', interval: 0 },
    //   notificationTime: 10,
    // };
    // setupMockHandlerCreation([testEvent]);
    // const { user } = setup(<App />);
    // await user.selectOptions(screen.getByLabelText('view'), 'month');
    // expect(screen.getByText(testEvent.title)).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    // setupMockHandlerCreation([]);
    // const { user } = setup(<App />);
    // await user.selectOptions(screen.getByLabelText('view'), 'month');
    // // 신정이 표시되는지 확인
    // expect(screen.getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    // setupMockHandlerCreation([]);
    // const { user } = setup(<App />);
    // await user.type(screen.getByLabelText('일정 검색'), '존재하지 않는 일정');
    // expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    // const testEvent = {
    //   id: '1',
    //   title: '팀 회의',
    //   date: '2024-10-15',
    //   startTime: '09:00',
    //   endTime: '10:00',
    //   description: '테스트',
    //   location: '회의실',
    //   category: '업무',
    //   repeat: { type: 'none', interval: 0 },
    //   notificationTime: 10,
    // };
    // setupMockHandlerCreation([testEvent]);
    // const { user } = setup(<App />);
    // await user.type(screen.getByLabelText('일정 검색'), '팀 회의');
    // expect(screen.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    // const testEvents: Event[] = [
    //   {
    //     id: '1',
    //     title: '팀 회의',
    //     date: '2024-10-15',
    //     startTime: '09:00',
    //     endTime: '10:00',
    //     description: '테스트1',
    //     location: '회의실A',
    //     category: '업무',
    //     repeat: { type: 'none', interval: 0 },
    //     notificationTime: 10,
    //   },
    //   {
    //     id: '2',
    //     title: '개인 일정',
    //     date: '2024-10-16',
    //     startTime: '14:00',
    //     endTime: '15:00',
    //     description: '테스트2',
    //     location: '회의실B',
    //     category: '개인',
    //     repeat: { type: 'none', interval: 0 },
    //     notificationTime: 10,
    //   },
    // ];
    // setupMockHandlerCreation(testEvents);
    // const { user } = setup(<App />);
    // const searchInput = screen.getByLabelText('일정 검색');
    // await user.type(searchInput, '팀 회의');
    // await user.clear(searchInput);
    // expect(screen.getByText('팀 회의')).toBeInTheDocument();
    // expect(screen.getByText('개인 일정')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    // const existingEvent = {
    //   id: '1',
    //   title: '기존 회의',
    //   date: '2024-10-15',
    //   startTime: '09:00',
    //   endTime: '10:00',
    //   description: '테스트',
    //   location: '회의실',
    //   category: '업무',
    //   repeat: { type: 'none', interval: 0 },
    //   notificationTime: 10,
    // };
    // setupMockHandlerCreation([existingEvent]);
    // const { user } = setup(<App />);
    // const newEvent = {
    //   title: '새 회의',
    //   date: '2024-10-15',
    //   startTime: '09:30',
    //   endTime: '10:30',
    //   description: '충돌 테스트',
    //   location: '회의실 B',
    //   category: '업무',
    // };
    // await saveSchedule(user, newEvent);
    // expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    // setupMockHandlerUpdating();
    // const { user } = setup(<App />);
    // // 첫 번째 일정 수정
    // await user.click(screen.getAllByLabelText('Edit event')[0]);
    // // 시간 수정하여 충돌 발생
    // await user.clear(screen.getByLabelText('시작 시간'));
    // await user.type(screen.getByLabelText('시작 시간'), '11:30');
    // await user.click(screen.getByTestId('event-submit-button'));
    // expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  // const testEvent = {
  //   id: '1',
  //   title: '알림 테스트',
  //   date: '2024-10-01',
  //   startTime: '09:00',
  //   endTime: '10:00',
  //   description: '테스트',
  //   location: '회의실',
  //   category: '업무',
  //   repeat: { type: 'none', interval: 0 },
  //   notificationTime: 10,
  // };
  // setupMockHandlerCreation([testEvent as Event]);
  // setup(<App />);
  // expect(screen.getByText('10분 전')).toBeInTheDocument();
});
