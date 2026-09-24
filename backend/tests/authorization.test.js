const authorize = require('../src/middleware/authorize');

describe('authorize middleware', () => {
  test('allows a permitted role', () => {
    const next = jest.fn();

    authorize('admin')({ user: { role: 'admin' } }, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('rejects a role without permission', () => {
    const next = jest.fn();

    authorize('admin')({ user: { role: 'student' } }, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' }),
    );
  });
});
