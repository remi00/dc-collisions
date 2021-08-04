const quantiles = require('./quantiles');

describe('quantiles', () => {
  test('four set', () => {
    const data = [0, 1, 2, 3];
    const q = quantiles(data);
    expect(q(1)).toEqual([data]);
    expect(q(2)).toEqual([[0, 1], [2, 3]]);
    expect(q(3)).toEqual([[0], [1], [2, 3]]);
    expect(q(4)).toEqual([[0], [1], [2], [3]]);
  });
  test('five set', () => {
    const data = [0, 1, 2, 3, 4];
    const q = quantiles(data);
    expect(q(1)).toEqual([data]);
    expect(q(2)).toEqual([[0, 1], [2, 3, 4]]);
    expect(q(3)).toEqual([[0], [1, 2], [3, 4]]);
    expect(q(4)).toEqual([[0], [1], [2], [3, 4]]);
    expect(q(5)).toEqual([[0], [1], [2], [3], [4]]);
  });
  test('six set', () => {
    const data = [0, 1, 2, 3, 4, 5];
    const q = quantiles(data);
    expect(q(1)).toEqual([data]);
    expect(q(2)).toEqual([[0, 1, 2], [3, 4, 5]]);
    expect(q(3)).toEqual([[0, 1], [2, 3], [4, 5]]);
    expect(q(4)).toEqual([[0], [1, 2], [3], [4, 5]]);
    expect(q(5)).toEqual([[0], [1], [2], [3], [4, 5]]);
    expect(q(6)).toEqual([[0], [1], [2], [3], [4], [5]]);
  });
  test('seven set', () => {
    const data = [0, 1, 2, 3, 4, 5, 6];
    const q = quantiles(data);
    expect(q(1)).toEqual([data]);
    expect(q(2)).toEqual([[0, 1, 2], [3, 4, 5, 6]]);
    expect(q(3)).toEqual([[0, 1], [2, 3], [4, 5, 6]]);
    expect(q(4)).toEqual([[0], [1, 2], [3, 4], [5, 6]]);
    expect(q(5)).toEqual([[0], [1], [2, 3], [4], [5, 6]]);
    expect(q(6)).toEqual([[0], [1], [2], [3], [4], [5, 6]]);
    expect(q(7)).toEqual([[0], [1], [2], [3], [4], [5], [6]]);
  });
  test('eight set', () => {
    const data = [0, 1, 2, 3, 4, 5, 6, 7];
    const q = quantiles(data);
    expect(q(1)).toEqual([data]);
    expect(q(2)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7]]);
    expect(q(3)).toEqual([[0, 1], [2, 3, 4], [5, 6, 7]]);
    expect(q(4)).toEqual([[0, 1], [2, 3], [4, 5], [6, 7]]);
    expect(q(5)).toEqual([[0], [1, 2], [3], [4, 5], [6, 7]]);
    expect(q(6)).toEqual([[0], [1], [2, 3], [4], [5], [6, 7]]);
    expect(q(7)).toEqual([[0], [1], [2], [3], [4], [5], [6, 7]]);
    expect(q(8)).toEqual([[0], [1], [2], [3], [4], [5], [6], [7]]);
  });
});
