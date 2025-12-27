import { validateSearchItemsQuery } from './search.validation';

describe('search.validation', () => {
  it('rejects empty query', () => {
    const errors = validateSearchItemsQuery({ q: ' ' });

    expect(errors).toEqual({ q: 'Query is required' });
  });

  it('rejects invalid limits and offsets', () => {
    const errors = validateSearchItemsQuery({ q: 'keys', limit: 0, offset: -1 });

    expect(errors).toEqual({
      limit: 'limit must be an integer between 1 and 200',
      offset: 'offset must be an integer >= 0',
    });
  });

  it('rejects invalid sort', () => {
    const errors = validateSearchItemsQuery({ q: 'keys', sort: 'price' as never });

    expect(errors).toEqual({ sort: 'sort must be one of: relevance, name, created_at' });
  });
});
