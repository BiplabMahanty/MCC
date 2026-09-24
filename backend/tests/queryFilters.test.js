const { escapeRegex, searchFilter } = require('../src/utils/queryFilters');

describe('query filters', () => {
  test('escapes regular-expression control characters', () => {
    expect(escapeRegex('A.*(B)?')).toBe('A\\.\\*\\(B\\)\\?');
  });

  test('builds a case-insensitive search across configured fields', () => {
    const filter = searchFilter('Ada', ['name', 'email']);

    expect(filter.$or).toHaveLength(2);
    expect(filter.$or[0].name).toBeInstanceOf(RegExp);
    expect(filter.$or[0].name.test('ADA LOVELACE')).toBe(true);
  });

  test('returns no filter when search is absent', () => {
    expect(searchFilter(undefined, ['name'])).toEqual({});
  });
});
