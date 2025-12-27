import { TestBed } from '@angular/core/testing';
import { ApiError } from '../shared/api-error';
import { RoomsApi } from './rooms.api';
import { RoomsListFacade } from './rooms-list.facade';
import type { RoomsListResponseDto } from './rooms.types';

type RoomsApiMock = {
  listRooms: jasmine.Spy;
  deleteRoom: jasmine.Spy;
};

describe('RoomsListFacade', () => {
  let facade: RoomsListFacade;
  let roomsApi: RoomsApiMock;

  const createDeferred = <T,>() => {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };

  beforeEach(() => {
    roomsApi = {
      listRooms: jasmine.createSpy('listRooms'),
      deleteRoom: jasmine.createSpy('deleteRoom'),
    };

    TestBed.configureTestingModule({
      providers: [
        RoomsListFacade,
        { provide: RoomsApi, useValue: roomsApi },
      ],
    });

    facade = TestBed.inject(RoomsListFacade);
  });

  it('blocks parallel loadRooms calls and maps data', async () => {
    const deferred = createDeferred<RoomsListResponseDto>();
    roomsApi.listRooms.and.returnValue(deferred.promise);

    const first = facade.loadRooms();
    const second = facade.loadRooms();

    expect(roomsApi.listRooms).toHaveBeenCalledTimes(1);
    const stateBefore = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(stateBefore.isLoading).toBeTrue();

    deferred.resolve({
      data: [{ id: 'room-1', name: 'Salon', color: '#aabbcc' }],
      meta: { limit: 1, offset: 0, total: 1 },
    });

    await Promise.all([first, second]);

    const stateAfter = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(stateAfter.isLoading).toBeFalse();
    expect(stateAfter.rooms).toEqual([{ id: 'room-1', name: 'Salon', color: '#aabbcc' }]);
  });

  it('validates room id on delete', async () => {
    let error: unknown;
    try {
      await facade.deleteRoom(' ');
    } catch (err) {
      error = err;
    }

    expect(error instanceof ApiError).toBeTrue();
    expect((error as ApiError).status).toBe(422);

    const state = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(state.error).toBe(error);
  });

  it('optimistically removes room and rolls back on error', async () => {
    const stateSubject = (facade as unknown as { stateSubject: { next: (value: any) => void } })
      .stateSubject;
    stateSubject.next({
      rooms: [
        { id: 'room-1', name: 'Room 1', color: '#111111' },
        { id: 'room-2', name: 'Room 2', color: '#222222' },
      ],
      isLoading: false,
      error: null,
    });

    roomsApi.deleteRoom.and.rejectWith(new Error('fail'));

    const promise = facade.deleteRoom('room-1');
    const optimistic = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(optimistic.rooms).toEqual([{ id: 'room-2', name: 'Room 2', color: '#222222' }]);

    let error: unknown;
    try {
      await promise;
    } catch (err) {
      error = err;
    }

    const restored = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(restored.rooms.length).toBe(2);
    expect(restored.error).toBe(error);
  });
});
