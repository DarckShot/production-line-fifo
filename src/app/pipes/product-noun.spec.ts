import { ProductNoun } from './product-noun';

describe('ProductNoun', () => {
  it.each([
    [0, 'продуктов'],
    [1, 'продукт'],
    [2, 'продукта'],
    [5, 'продуктов'],
    [11, 'продуктов'],
    [14, 'продуктов'],
    [21, 'продукт'],
    [22, 'продукта'],
    [25, 'продуктов'],
  ])('formats %i as %s', (count, expected) => {
    expect(new ProductNoun().transform(count)).toBe(expected);
  });
});
