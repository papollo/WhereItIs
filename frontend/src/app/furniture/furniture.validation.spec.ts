import {
  validateCreateFurnitureCommand,
  validateFurniturePlacementRequest,
  validateListFurnitureQuery,
  validateUpdateFurnitureCommand,
} from './furniture.validation';

describe('furniture.validation', () => {
  it('rejects missing name and invalid color on create', () => {
    const errors = validateCreateFurnitureCommand({
      name: ' ',
      description: null,
      color: 'red',
      room_id: 'room-1',
    });

    expect(errors).toEqual({
      name: 'Name is required',
      color: 'Color must be a hex value like #aabbcc',
    });
  });

  it('rejects too long description on update', () => {
    const errors = validateUpdateFurnitureCommand({
      description: 'a'.repeat(501),
    });

    expect(errors).toEqual({ description: 'Description must be at most 500 characters' });
  });

  it('rejects missing room id and invalid placement bounds', () => {
    const errors = validateFurniturePlacementRequest({
      room_id: ' ',
      x: -1,
      y: 50,
      width_cells: 0,
      height_cells: 51,
    });

    expect(errors).toEqual({
      room_id: 'Room id is required',
      x: 'x must be an integer between 0 and 49',
      y: 'y must be an integer between 0 and 49',
      width_cells: 'width_cells must be an integer between 1 and 50',
      height_cells: 'height_cells must be an integer between 1 and 50',
    });
  });

  it('rejects offset without limit', () => {
    const errors = validateListFurnitureQuery({ roomId: 'room-1', offset: 10 });

    expect(errors).toEqual({ offset: 'offset requires limit to be set' });
  });
});
