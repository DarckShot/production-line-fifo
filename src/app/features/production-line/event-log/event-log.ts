import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import type { LineEvent } from '../models/line-event.model';

@Component({
  selector: 'app-event-log',
  imports: [DatePipe],
  template: `
    <section aria-labelledby="event-log-heading">
      <p class="eyebrow">04 / История линии</p>
      <h2 id="event-log-heading">Журнал событий</h2>
      @if (recentEvents().length) {
        <p class="order-hint">Сначала новые события, ранние — ниже.</p>
        <ul class="entries">
          @for (event of recentEvents(); track event.id; let isFirst = $first) {
            <li [class.latest]="isFirst">
              <div class="entry-heading">
                <time [attr.datetime]="event.occurredAt.toISOString()">{{ event.occurredAt | date: 'dd.MM.yyyy HH:mm:ss' }}</time>
                @if (isFirst) { <span class="latest-label">Последнее событие</span> }
              </div>
              <p class="description">{{ event.description }}</p>
              @if (event.productId) { <p class="product-id">ID продукта: {{ event.productId }}</p> }
            </li>
          }
        </ul>
      } @else {
        <p class="empty-state">Событий пока нет</p>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    section { min-width: 0; padding: 1.4rem; border: 1px solid #d3dcdf; border-radius: 16px; background: #fff; box-shadow: 0 4px 18px #1b3b4510; }
    .eyebrow { margin: 0 0 .65rem; color: #246c69; font-family: ui-monospace, monospace; font-size: .72rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    h2 { margin: 0; color: #162e39; font-size: 1.25rem; letter-spacing: -.025em; }
    .order-hint { margin: .4rem 0 1rem; color: #52656d; font-size: .8rem; line-height: 1.45; }
    .entries { display: grid; gap: .6rem; max-height: 23rem; margin: 0; padding: .1rem .15rem .2rem; overflow-y: auto; list-style: none; scrollbar-color: #9ab0b1 transparent; }
    .entries li { padding: .7rem .75rem; border: 1px solid #d7e0e2; border-radius: 8px; background: #f7f9f9; color: #172b39; }
    .entries li.latest { border-color: #78aaa3; background: #eaf5f2; }
    .entry-heading { display: flex; align-items: center; flex-wrap: wrap; gap: .4rem; }
    time { color: #435c65; font-family: ui-monospace, monospace; font-size: .72rem; font-variant-numeric: tabular-nums; }
    .latest-label { padding: .17rem .4rem; border-radius: 4px; background: #176e68; color: #fff; font-size: .65rem; font-weight: 800; }
    .description { margin: .4rem 0; font-size: .84rem; font-weight: 750; line-height: 1.4; }
    .product-id { margin: 0; color: #52656d; font-family: ui-monospace, monospace; font-size: .72rem; overflow-wrap: anywhere; }
    .empty-state { margin: 1rem 0 0; padding: 1.5rem; border: 1px dashed #b9c9cc; border-radius: 8px; color: #52656d; text-align: center; font-size: .88rem; }
  `,
})
export class EventLog {
  readonly events = input.required<readonly LineEvent[]>();
  protected readonly recentEvents = computed(() => this.events().slice(0, 20));
}
