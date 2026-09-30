import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'productNoun',
})
export class ProductNoun implements PipeTransform {
  transform(count: number): string {
    if (count % 10 === 1 && count % 100 !== 11) {
      return 'продукт';
    }
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) {
      return 'продукта';
    }
    return 'продуктов';
  }
}
