import { Component } from '@angular/core';

@Component({
  selector: 'app-product-form',
  template: `
    <section aria-labelledby="add-product-heading">
      <h2 id="add-product-heading">Добавить продукт</h2>
      <form>
        <label for="product-id">ID продукта</label>
        <input id="product-id" name="productId" type="text" disabled />
        <button type="button" disabled>Добавить</button>
      </form>
    </section>
  `,
})
export class ProductForm {}
