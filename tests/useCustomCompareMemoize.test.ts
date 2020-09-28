import { renderHook } from '@testing-library/react-hooks';
import { dequal } from 'dequal';
import {
  checkDeps,
  useCustomCompareMemoize,
} from '../src/useCustomCompareMemoize';

jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('checkDeps', () => {
  it('should throw an error with an empty array deps', () => {
    expect(() =>
      checkDeps([], () => true, 'useCustomCompareEffect'),
    ).toThrowError(
      'useCustomCompareEffect should not be used with no dependencies. Use React.useEffect instead.',
    );
  });

  it('should throw an error with an array deps of only primitive values', () => {
    expect(() =>
      checkDeps([true, 1, 'string'], () => true, 'useCustomCompareEffect'),
    ).toThrowError(
      'useCustomCompareEffect should not be used with dependencies that are all primitive values. Use React.useEffect instead.',
    );
  });

  it('should throw an error with a depsAreEqual of primitive value', () => {
    expect(() =>
      // @ts-ignore
      checkDeps([1, { a: 'b' }, true], 1, 'useCustomCompareEffect'),
    ).toThrowError(
      'useCustomCompareEffect should be used with depsEqual callback for comparing deps list',
    );
  });
});

describe('useCustomCompareMemoize', () => {
  it('should handle changing deps as expected', () => {
    let deps = [1, { a: 'b' }, true];

    const { rerender, result } = renderHook(() =>
      useCustomCompareMemoize(deps, dequal),
    );

    expect(result.current).toEqual([1, { a: 'b' }, true]);

    // no change
    rerender();
    expect(result.current).toEqual([1, { a: 'b' }, true]);

    // no change (new object with same properties)
    deps = [1, { a: 'b' }, true];
    rerender();
    expect(result.current).toEqual([1, { a: 'b' }, true]);

    // change (new primitive value)
    deps = [2, { a: 'b' }, true];
    rerender();
    expect(result.current).toEqual([2, { a: 'b' }, true]);

    // no change
    rerender();
    expect(result.current).toEqual([2, { a: 'b' }, true]);

    // change (new primitive value)
    deps = [1, { a: 'b' }, false];
    rerender();
    expect(result.current).toEqual([1, { a: 'b' }, false]);

    // change (new properties on object)
    deps = [1, { a: 'c' }, false];
    rerender();
    expect(result.current).toEqual([1, { a: 'c' }, false]);
  });
});
