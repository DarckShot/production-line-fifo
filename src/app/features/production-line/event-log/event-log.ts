import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import type { LineEvent } from '../models/line-event.model';

@Component({
  selector: 'app-event-log',
  imports: [DatePipe],
  template: `
    <section aria-labelledby="event-log-heading">
      <h2 id="event-log-heading">Журнал событий</h2>
      @if (chronologicalEvents().length) {
        <p class="order-hint">Сначала ранние события, новые — внизу.</p>
        <ol class="entries">
          @for (event of chronologicalEvents(); track event.id; let isLast = $last) {
            <li [class.latest]="isLast">
              <div class="entry-heading">
                <time [attr.datetime]="event.occurredAt.toISOString()">{{ event.occurredAt | date: 'dd.MM.yyyy HH:mm:ss' }}</time>
                @if (isLast) { <span class="latest-label">Последнее событие</span> }
              </div>
              <p class="description">{{ event.description }}</p>
              @if (event.productId) { <p class="product-id">ID продукта: {{ event.productId }}</p> }
            </li>
          }
        </ol>
      } @else {
        <p class="empty-state">Событий пока нет</p>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    section { padding: clamp(1rem, 3vw, 2rem); border: 1px solid #cbd5e1; border-radius: 20px; background: #fff; }
    h2 { margin: 0; color: #0f172a; font-size: 1.4rem; }
    .order-hint { margin: .5rem 0 1rem; color: #475569; font-size: .875rem; }
    .entries { display: grid; gap: .75rem; margin: 0; padding-left: 2rem; }
    .entries li { padding: .75rem 1rem; border: 1px solid #cbd5e1; border-radius: 10px; background: #f8fafc; color: #0f172a; }
    .entries li::marker { color: #475569; font-weight: 700; }
    .entries li.latest { border-color: #0f766e; background: #f0fdfa; }
    .entry-heading { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; }
    time { color: #334155; font-size: .85rem; }
    .latest-label { padding: .15rem .45rem; border-radius: 999px; background: #0f766e; color: #fff; font-size: .72rem; font-weight: 700; }
    .description { margin: .45rem 0; font-weight: 650; }
    .product-id { margin: 0; color: #334155; font-size: .85rem; overflow-wrap: anywhere; }
    .empty-state { margin: 1rem 0 0; color: #475569; }
  `,
})
export class EventLog {
  readonly events = input.required<readonly LineEvent[]>();
  protected readonly chronologicalEvents = computed(() => [...this.events().slice(0, 20)].reverse());
}
