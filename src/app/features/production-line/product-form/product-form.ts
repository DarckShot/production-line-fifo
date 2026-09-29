import { Component, inject, signal } from '@angular/core';
import { FormField, form, submit, validate } from '@angular/forms/signals';
import { ProductionLineStore } from '../production-line-store';

@Component({
  selector: 'app-product-form',
  imports: [FormField],
  template: `
    <section aria-labelledby="add-product-heading">
      <p class="eyebrow">01 / Вход линии</p>
      <h2 id="add-product-heading">Добавить продукт</h2>
      <p class="hint">Новый продукт займёт место у датчика входа.</p>
      <form (submit)="onSubmit($event)">
        <label for="product-id">ID продукта</label>
        <input
          id="product-id"
          type="text"
          placeholder="Например, PRD-042"
          autocomplete="off"
          [formField]="productForm.productId"
          [attr.aria-invalid]="productForm.productId().touched() && productForm.productId().invalid()"
          [attr.aria-describedby]="productForm.productId().touched() && productForm.productId().invalid() ? 'product-id-error' : null"
        />
        @if (productForm.productId().touched() && productForm.productId().errors().length) {
          <p id="product-id-error" role="alert">{{ productForm.productId().errors()[0].message }}</p>
        }
        <button type="submit">Добавить в очередь <span aria-hidden="true">↗</span></button>
      </form>
    </section>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    section { height: 100%; padding: 1.4rem; border: 1px solid #d3dcdf; border-radius: 16px; background: #fff; box-shadow: 0 4px 18px #1b3b4510; }
    .eyebrow { margin: 0 0 .65rem; color: #246c69; font-family: ui-monospace, monospace; font-size: .72rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    h2 { margin: 0; color: #162e39; font-size: 1.25rem; letter-spacing: -.025em; }
    .hint { margin: .4rem 0 1.25rem; color: #52656d; font-size: .88rem; line-height: 1.45; }
    form { display: grid; gap: .6rem; }
    label { color: #243a45; font-size: .82rem; font-weight: 750; }
    input { width: 100%; min-height: 46px; padding: .7rem .8rem; border: 1px solid #94aab0; border-radius: 8px; background: #f8fbfb; color: #172b39; outline: none; }
    input::placeholder { color: #667b83; }
    input:focus-visible { border-color: #176e68; box-shadow: 0 0 0 3px #176e6833; }
    input[aria-invalid='true'] { border-color: #aa3535; }
    [role='alert'] { margin: 0; color: #9d2929; font-size: .82rem; font-weight: 650; }
    button { display: flex; justify-content: space-between; align-items: center; min-height: 46px; margin-top: .3rem; padding: .7rem .85rem; border: 0; border-radius: 8px; background: #176e68; color: #fff; font-weight: 750; cursor: pointer; }
    button:hover { background: #105752; }
    button:focus-visible { outline: 3px solid #176e68; outline-offset: 3px; }
    button span { font-size: 1.2rem; line-height: 1; }
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
