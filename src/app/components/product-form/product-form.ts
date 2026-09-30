import { Component, inject, signal } from '@angular/core';
import { FormField, form, submit, validate } from '@angular/forms/signals';
import { ProductionLineStore } from '../../services/production-line-store';

@Component({
  selector: 'app-product-form',
  imports: [FormField],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
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
