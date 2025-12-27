import {
  validateCreateItemsRequest,
  validateListFurnitureItemsQuery,
  validateRenameItemRequest,
} from './items.validation';

describe('items.validation', () => {
  it('rejects empty item list', () => {
    const errors = validateCreateItemsRequest({ items: [] });

    expect(errors).toEqual({ items: 'At least one item is required' });
  });

  it('rejects empty and too long item names', () => {
    const errors = validateCreateItemsRequest({
      items: [{ name: ' ' }, { name: 'a'.repeat(201) }],
    });

    expect(errors).toEqual({
      'items.0.name': 'Name is required',
      'items.1.name': 'Name must be at most 200 characters',
    });
  });

  it('rejects offset without limit in list query', () => {
    const errors = validateListFurnitureItemsQuery({ furnitureId: 'f-1', offset: 10 });

    expect(errors).toEqual({ offset: 'offset requires limit to be set' });
  });

  it('rejects too long name on rename', () => {
    const errors = validateRenameItemRequest({ name: 'a'.repeat(201) });

    expect(errors).toEqual({ name: 'Name must be at most 200 characters' });
  });
});
