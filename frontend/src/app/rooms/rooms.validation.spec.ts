import {
  validateCreateRoomCommand,
  validateListRoomsQuery,
  validateRoomCellsRequest,
} from './rooms.validation';

describe('rooms.validation', () => {
  it('rejects invalid hex color', () => {
    const errors = validateCreateRoomCommand({ name: 'Room', color: 'blue' });

    expect(errors).toEqual({ color: 'Color must be a hex value like #aabbcc' });
  });

  it('rejects too long room name', () => {
    const errors = validateCreateRoomCommand({
      name: 'a'.repeat(121),
      color: '#aabbcc',
    });

    expect(errors).toEqual({ name: 'Name must be at most 120 characters' });
  });

  it('rejects offset without limit', () => {
    const errors = validateListRoomsQuery({ offset: 10 });

    expect(errors).toEqual({ offset: 'offset requires limit to be set' });
  });

  it('rejects room cells outside 0..49 range', () => {
    const errors = validateRoomCellsRequest({
      cells: [
        { x: -1, y: 0 },
        { x: 0, y: 50 },
      ],
    });

    expect(errors).toEqual({
      'cells.0.x': 'x must be an integer between 0 and 49',
      'cells.1.y': 'y must be an integer between 0 and 49',
    });
  });
});
