import { TestBed } from '@angular/core/testing';
import { ApiError } from '../shared/api-error';
import { RoomsApi } from './rooms.api';
import { RoomEditorFacade } from './room-editor.facade';
import type { RoomDto, RoomCellsGetResponseDto } from './rooms.types';

type RoomsApiMock = {
  getRoom: jasmine.Spy;
  getRoomCells: jasmine.Spy;
  createRoom: jasmine.Spy;
  updateRoom: jasmine.Spy;
  replaceRoomCells: jasmine.Spy;
};

describe('RoomEditorFacade', () => {
  let facade: RoomEditorFacade;
  let roomsApi: RoomsApiMock;

  beforeEach(() => {
    roomsApi = {
      getRoom: jasmine.createSpy('getRoom'),
      getRoomCells: jasmine.createSpy('getRoomCells'),
      createRoom: jasmine.createSpy('createRoom'),
      updateRoom: jasmine.createSpy('updateRoom'),
      replaceRoomCells: jasmine.createSpy('replaceRoomCells'),
    };

    TestBed.configureTestingModule({
      providers: [
        RoomEditorFacade,
        { provide: RoomsApi, useValue: roomsApi },
      ],
    });

    facade = TestBed.inject(RoomEditorFacade);
  });

  it('marks notFound on 404 and clears state', async () => {
    const notFound = ApiError.notFound('Room not found');
    roomsApi.getRoom.and.rejectWith(notFound);
    roomsApi.getRoomCells.and.resolveTo({ room_id: 'room-1', cells: [] } as RoomCellsGetResponseDto);

    await facade.load('room-1');

    const state = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(state.notFound).toBeTrue();
    expect(state.room).toBeNull();
    expect(state.cells).toEqual([]);
    expect(state.error).toBeNull();
  });

  it('merges updateRoom response with current room', async () => {
    const stateSubject = (facade as unknown as { stateSubject: { next: (value: any) => void } })
      .stateSubject;
    const currentRoom: RoomDto = {
      id: 'room-1',
      name: 'Old',
      color: '#111111',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };
    stateSubject.next({
      room: currentRoom,
      cells: [],
      isLoading: false,
      isSaving: false,
      error: null,
      notFound: false,
    });

    roomsApi.updateRoom.and.resolveTo({
      id: 'room-1',
      name: 'New',
      color: '#222222',
      updated_at: '2024-02-01',
    });

    await facade.updateRoom('room-1', { name: 'New', color: '#222222' });

    const state = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(state.room.name).toBe('New');
    expect(state.room.color).toBe('#222222');
    expect(state.room.created_at).toBe('2024-01-01');
    expect(state.room.updated_at).toBe('2024-02-01');
  });

  it('replaces room cells after successful save', async () => {
    roomsApi.replaceRoomCells.and.resolveTo({ room_id: 'room-1', cells_saved: 2 });

    await facade.replaceRoomCells('room-1', [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);

    const state = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(state.cells).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
  });
});
