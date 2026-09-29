import { Component, inject, signal } from '@angular/core';
import { FormField, form, submit, validate } from '@angular/forms/signals';
import { ProductionLineStore } from '../production-line-store';

@Component({
  selector: 'app-product-form',
  imports: [FormField],
  template: `
    <section aria-labelledby="add-product-heading">
      <h2 id="add-product-heading">Добавить продукт</h2>
      <form (submit)="onSubmit($event)">
        <label for="product-id">ID продукта</label>
        <input
          id="product-id"
          type="text"
          [formField]="productForm.productId"
          [attr.aria-invalid]="productForm.productId().touched() && productForm.productId().invalid()"
          [attr.aria-describedby]="productForm.productId().touched() && productForm.productId().invalid() ? 'product-id-error' : null"
        />
        @if (productForm.productId().touched() && productForm.productId().errors().length) {
          <p id="product-id-error" role="alert">{{ productForm.productId().errors()[0].message }}</p>
        }
        <button type="submit">Добавить</button>
      </form>
    </section>
  `,
})
export class ProductForm {
  private readonly store = inject(ProductionLineStore);
  private readonly productModel = signal({ productId: '' });

  protected readonly productForm = form(this.productModel, (path) => {
    validate(path.productId, ({ value }) => {
      const id = value().trim();
      if (!id) {
        return { kind: 'required', message: 'Введите ID продукта' };
      }
      if (this.store.products().some((product) => product.id === id)) {
        return { kind: 'duplicate', message: 'Продукт с таким ID уже есть в очереди' };
      }
      return undefined;
    });
  });

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void submit(this.productForm, async () => {
      this.store.addProduct({
        id: this.productModel().productId.trim(),
        arrivedAt: new Date(),
        status: 'В очереди',
      });
      this.productModel.set({ productId: '' });
      this.productForm().reset();
    });
  }
}
