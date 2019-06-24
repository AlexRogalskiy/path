import { posixify } from '../posixify';

describe('posixify', () => {
  it('wraps all obj methods', () => {
    const obj = {
      test() {
        return false;
      },

      baz: (d: unknown) => true,
    };

    const result = posixify(obj, obj);
    expect(result).not.toStrictEqual(obj);
    expect(result).toMatchObject({
      test: expect.any(Function),
      baz: expect.any(Function),
    });
  });

  it('wrapped method returning string normalizes the return', () => {
    const obj = {
      test: () => 'c:\\foo\\baz',
    };

    const result = posixify(obj, obj);
    expect(result.test()).toEqual('c:/foo/baz');
  });

  it('wrapped method returning non-string value is supported', () => {
    const obj = {
      test: () => false,
    };

    const result = posixify(obj, obj);
    expect(result.test()).toEqual(false);
  });

  it('copies properties whose values are not functions', () => {
    const obj = {
      foo: 'bar',
      bar: {},
      c: null,
    };

    expect(posixify({ ...obj }, { ...obj })).toStrictEqual(obj);
  });

  it('includes non-enumerable properties', () => {
    const obj = Object.defineProperty({}, 'a', {
      enumerable: false,
      value: 2,
    });

    expect(posixify(obj, obj)).toHaveProperty('a', 2);
  });

  it('makes use of alternative method if url is detected', () => {
    const obj = {
      test: (a: string) => 'http://baz.com',
    };
    const altObj = {
      test: () => 'foo.com',
    };

    const result = posixify(obj, altObj);
    expect(result.test('http://baz.com')).toEqual('foo.com');
  });

  it('throws if alternative method is not implemented', () => {
    const obj = {
      test: (a: string) => 'http://baz.com',
    };

    const result = posixify(obj, {});
    expect(() => result.test('http://baz.com')).toThrow();
  });
});
