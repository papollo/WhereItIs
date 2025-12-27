import { TestBed } from '@angular/core/testing';
import { ApiError } from '../shared/api-error';
import { FurnitureApi } from '../furniture/furniture.api';
import type { FurnitureDto, FurniturePlacementDto } from '../furniture/furniture.types';
import { mapFurnitureToListItem } from '../furniture/furniture.view-models';
import { RoomsApi } from './rooms.api';
import { RoomDetailsFacade } from './room-details.facade';
import type { RoomDto, RoomCellsGetResponseDto } from './rooms.types';

type RoomsApiMock = {
  getRoom: jasmine.Spy;
  getRoomCells: jasmine.Spy;
};

type FurnitureApiMock = {
  listFurniture: jasmine.Spy;
  getFurniturePlacement: jasmine.Spy;
  createFurniture: jasmine.Spy;
  upsertFurniturePlacement: jasmine.Spy;
  updateFurniture: jasmine.Spy;
  deleteFurniture: jasmine.Spy;
};

describe('RoomDetailsFacade', () => {
  let facade: RoomDetailsFacade;
  let roomsApi: RoomsApiMock;
  let furnitureApi: FurnitureApiMock;

  const createRoom = (): RoomDto => ({
    id: 'room-1',
    name: 'Room',
    color: '#aabbcc',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  });

  const createFurniture = (id: string, name: string, color: string): FurnitureDto => ({
    id,
    room_id: 'room-1',
    name,
    description: null,
    color,
    created_at: '2024-01-01',
    updated_at: '2024-01-02',
  });

  const createPlacement = (furnitureId: string): FurniturePlacementDto => ({
    furniture_id: furnitureId,
    room_id: 'room-1',
    x: 1,
    y: 2,
    width_cells: 2,
    height_cells: 3,
  });

  beforeEach(() => {
    roomsApi = {
      getRoom: jasmine.createSpy('getRoom'),
      getRoomCells: jasmine.createSpy('getRoomCells'),
    };
    furnitureApi = {
      listFurniture: jasmine.createSpy('listFurniture'),
      getFurniturePlacement: jasmine.createSpy('getFurniturePlacement'),
      createFurniture: jasmine.createSpy('createFurniture'),
      upsertFurniturePlacement: jasmine.createSpy('upsertFurniturePlacement'),
      updateFurniture: jasmine.createSpy('updateFurniture'),
      deleteFurniture: jasmine.createSpy('deleteFurniture'),
    };

    TestBed.configureTestingModule({
      providers: [
        RoomDetailsFacade,
        { provide: RoomsApi, useValue: roomsApi },
        { provide: FurnitureApi, useValue: furnitureApi },
      ],
    });

    facade = TestBed.inject(RoomDetailsFacade);
  });

  it('marks notFound on 404 and clears state', async () => {
    roomsApi.getRoom.and.rejectWith(ApiError.notFound('Room not found'));
    roomsApi.getRoomCells.and.resolveTo({ room_id: 'room-1', cells: [] } as RoomCellsGetResponseDto);
    furnitureApi.listFurniture.and.resolveTo([]);

    await facade.load('room-1');

    const state = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(state.notFound).toBeTrue();
    expect(state.room).toBeNull();
    expect(state.cells).toEqual([]);
    expect(state.furniture).toEqual([]);
    expect(state.placements).toEqual([]);
    expect(state.error).toBeNull();
  });

  it('loads placements and tolerates missing furniture placements', async () => {
    roomsApi.getRoom.and.resolveTo(createRoom());
    roomsApi.getRoomCells.and.resolveTo({ room_id: 'room-1', cells: [] } as RoomCellsGetResponseDto);
    const furniture = [
      createFurniture('f-1', 'Chair', '#111111'),
      createFurniture('f-2', 'Desk', '#222222'),
    ];
    furnitureApi.listFurniture.and.resolveTo(furniture);
    furnitureApi.getFurniturePlacement.and.callFake((id: string) => {
      if (id === 'f-1') {
        return Promise.resolve(createPlacement('f-1'));
      }
      return Promise.reject(new Error('missing'));
    });

    await facade.load('room-1');

    const state = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(state.placements.length).toBe(1);
    expect(state.placements[0]).toEqual({
      furniture_id: 'f-1',
      room_id: 'room-1',
      x: 1,
      y: 2,
      width_cells: 2,
      height_cells: 3,
      color: '#111111',
      name: 'Chair',
    });
  });

  it('creates furniture with placement and updates state', async () => {
    furnitureApi.createFurniture.and.resolveTo(createFurniture('f-3', 'Lamp', '#333333'));
    furnitureApi.upsertFurniturePlacement.and.resolveTo(createPlacement('f-3'));

    await facade.createFurniture(
      'room-1',
      { name: 'Lamp', description: '', color: '#333333' },
      { room_id: 'room-1', x: 1, y: 2, width_cells: 2, height_cells: 3 }
    );

    const state = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(state.furniture.length).toBe(1);
    expect(state.furniture[0]).toEqual(mapFurnitureToListItem(createFurniture('f-3', 'Lamp', '#333333')));
    expect(state.placements.length).toBe(1);
    expect(state.placements[0].furniture_id).toBe('f-3');
    expect(state.placements[0].color).toBe('#333333');
    expect(state.placements[0].name).toBe('Lamp');
  });

  it('updates furniture and placement details', async () => {
    const stateSubject = (facade as unknown as { stateSubject: { next: (value: any) => void } })
      .stateSubject;
    stateSubject.next({
      room: createRoom(),
      cells: [],
      furniture: [mapFurnitureToListItem(createFurniture('f-1', 'Chair', '#111111'))],
      placements: [
        {
          ...createPlacement('f-1'),
          color: '#111111',
          name: 'Chair',
        },
      ],
      isLoading: false,
      error: null,
      notFound: false,
    });

    furnitureApi.updateFurniture.and.resolveTo(createFurniture('f-1', 'Chair New', '#444444'));
    furnitureApi.upsertFurniturePlacement.and.resolveTo({
      furniture_id: 'f-1',
      room_id: 'room-1',
      x: 5,
      y: 6,
      width_cells: 1,
      height_cells: 2,
    });

    await facade.updateFurniture(
      'f-1',
      { name: 'Chair New', description: '', color: '#444444' },
      { room_id: 'room-1', x: 5, y: 6, width_cells: 1, height_cells: 2 }
    );

    const state = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(state.furniture[0].name).toBe('Chair New');
    expect(state.furniture[0].color).toBe('#444444');
    expect(state.placements[0].color).toBe('#444444');
    expect(state.placements[0].name).toBe('Chair New');
    expect(state.placements[0].x).toBe(5);
    expect(state.placements[0].y).toBe(6);
  });

  it('rolls back deleteFurniture on error', async () => {
    const stateSubject = (facade as unknown as { stateSubject: { next: (value: any) => void } })
      .stateSubject;
    const furniture = mapFurnitureToListItem(createFurniture('f-1', 'Chair', '#111111'));
    stateSubject.next({
      room: createRoom(),
      cells: [],
      furniture: [furniture],
      placements: [
        {
          ...createPlacement('f-1'),
          color: '#111111',
          name: 'Chair',
        },
      ],
      isLoading: false,
      error: null,
      notFound: false,
    });

    furnitureApi.deleteFurniture.and.rejectWith(new Error('fail'));

    const promise = facade.deleteFurniture('f-1');
    const optimistic = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(optimistic.furniture).toEqual([]);
    expect(optimistic.placements).toEqual([]);

    let error: unknown;
    try {
      await promise;
    } catch (err) {
      error = err;
    }

    const restored = (facade as unknown as { stateSubject: { getValue: () => any } })
      .stateSubject.getValue();
    expect(restored.furniture).toEqual([furniture]);
    expect(restored.placements.length).toBe(1);
    expect(restored.error).toBe(error);
  });
});
