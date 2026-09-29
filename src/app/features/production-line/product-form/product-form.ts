import { Component, inject, signal } from '@angular/core';
import { FormField, form, submit, validate } from '@angular/forms/signals';
import { ProductionLineStore } from '../production-line-store';

@Component({
  selector: 'app-product-form',
  imports: [FormField],
  template: `
    <section aria-labelledby="add-product-heading">
      <p class="eyebrow"><span aria-hidden="true">✳</span> БЫСТРОЕ ДЕЙСТВИЕ</p>
      <h2 id="add-product-heading">Добавить продукт</h2>
      <p class="hint">Новый продукт появится у датчика входа.</p>
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
        <button type="submit">Добавить в очередь <span aria-hidden="true">→</span></button>
      </form>
    </section>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    section { height: 100%; padding: 1.25rem; border: 1px solid var(--line); border-radius: 16px; background: var(--paper); box-shadow: var(--shadow); }
    .eyebrow { display: flex; align-items: center; gap: .35rem; margin: 0 0 .75rem; color: #2f7058; font-family: ui-monospace, monospace; font-size: .62rem; font-weight: 800; letter-spacing: .09em; }
    .eyebrow span { color: #498362; font-size: 1rem; line-height: .7; }
    h2 { margin: 0; color: var(--ink); font-size: 1.25rem; font-weight: 800; letter-spacing: -.04em; line-height: 1.15; }
    .hint { margin: .5rem 0 1.3rem; color: var(--muted); font-size: .78rem; line-height: 1.45; }
    form { display: grid; gap: .55rem; }
    label { color: #36584a; font-size: .72rem; font-weight: 800; }
    input { width: 100%; min-height: 46px; padding: .68rem .75rem; border: 1px solid #c4d4c8; border-radius: 7px; background: #fafcf8; color: var(--ink); outline: none; }
    input::placeholder { color: #72837a; }
    input:focus-visible { border-color: var(--green); box-shadow: 0 0 0 3px #17695830; }
    input[aria-invalid='true'] { border-color: #ac4138; }
    [role='alert'] { margin: 0; color: #9c352f; font-size: .75rem; font-weight: 700; line-height: 1.35; }
    button { display: flex; align-items: center; justify-content: space-between; min-height: 46px; margin-top: .35rem; padding: .6rem .78rem; border: 0; border-radius: 7px; background: var(--green); color: #fff; font-size: .78rem; font-weight: 800; cursor: pointer; transition: background 160ms, transform 160ms; }
    button:hover { background: #0c5547; transform: translateY(-1px); }
    button:focus-visible { outline: 3px solid var(--green); outline-offset: 3px; }
    button span { font-size: 1.2rem; line-height: 1; }
    @media (prefers-reduced-motion: reduce) { button { transition: none; } }
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
