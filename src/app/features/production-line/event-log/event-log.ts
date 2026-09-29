import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import type { LineEvent } from '../models/line-event.model';

@Component({
  selector: 'app-event-log',
  imports: [DatePipe],
  template: `
    <section aria-labelledby="event-log-heading">
      <p class="eyebrow">ИСТОРИЯ ОПЕРАЦИЙ</p>
      <div class="log-title">
        <h2 id="event-log-heading">Журнал событий</h2>
        <span>{{ recentEvents().length }} / 20</span>
      </div>
      @if (recentEvents().length) {
        <p class="order-hint">Новые события — сверху</p>
        <ul class="entries" tabindex="0" aria-label="Последние события линии">
          @for (event of recentEvents(); track event.id; let isFirst = $first) {
            <li [class.latest]="isFirst" [class.entry--removed]="event.type === 'removed-manually' || event.type === 'removed-on-tick'" [class.entry--status]="event.type === 'status-changed'">
              <span class="entry-dot" aria-hidden="true"></span>
              <div class="entry-content">
                <div class="entry-heading">
                  <time [attr.datetime]="event.occurredAt.toISOString()">{{ event.occurredAt | date: 'dd.MM.yyyy HH:mm:ss' }}</time>
                  @if (isFirst) { <span class="latest-label">Последнее событие</span> }
                </div>
                <p class="description">{{ event.description }}</p>
                @if (event.productId) { <p class="product-id">ID продукта: {{ event.productId }}</p> }
              </div>
            </li>
          }
        </ul>
      } @else {
        <p class="empty-state">Событий пока нет</p>
      }
    </section>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    section { height: 100%; min-width: 0; padding: 1.25rem; border: 1px solid var(--line); border-radius: 16px; background: var(--paper); box-shadow: var(--shadow); }
    .eyebrow { margin: 0 0 .75rem; color: #2f7058; font-family: ui-monospace, monospace; font-size: .62rem; font-weight: 800; letter-spacing: .09em; }
    .log-title { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
    h2 { margin: 0; color: var(--ink); font-size: 1.25rem; font-weight: 800; letter-spacing: -.04em; line-height: 1.15; }
    .log-title span { padding: .3rem .4rem; border-radius: 5px; background: #eaf3e9; color: #2b6342; font-family: ui-monospace, monospace; font-size: .67rem; font-weight: 800; white-space: nowrap; }
    .order-hint { margin: .5rem 0 .95rem; color: var(--muted); font-size: .74rem; }
    .entries { display: grid; gap: 0; max-height: 32rem; margin: 0; padding: .15rem .1rem .15rem .55rem; overflow-y: auto; list-style: none; }
    .entries::-webkit-scrollbar { width: 12px; }
    .entries::-webkit-scrollbar-track { border-radius: 999px; background: #dbe8de; }
    .entries::-webkit-scrollbar-thumb { border: 2px solid #dbe8de; border-radius: 999px; background: #559174; }
    .entries::-webkit-scrollbar-thumb:hover { background: #31795d; }
    .entries:focus-visible { outline: 3px solid var(--green); outline-offset: 2px; }
    .entries li { position: relative; display: grid; grid-template-columns: .7rem minmax(0, 1fr); gap: .55rem; padding: .7rem .5rem; border-bottom: 1px solid #e9eee8; color: var(--ink); }
    .entries li:last-child { border-bottom: 0; }
    .entries li.latest { background: linear-gradient(90deg, #eef7e9, transparent 90%); }
    .entry-dot { width: .5rem; height: .5rem; margin-top: .22rem; border: 2px solid #257e5f; border-radius: 50%; background: #d7f0dc; }
    .entry--removed .entry-dot { border-color: #a45040; background: #f5dcd6; }
    .entry--status .entry-dot { border-color: #a47424; background: #f9e9c5; }
    .entry-heading { display: flex; align-items: center; flex-wrap: wrap; gap: .35rem; }
    time { color: #597266; font-family: ui-monospace, monospace; font-size: .62rem; font-variant-numeric: tabular-nums; }
    .latest-label { padding: .13rem .3rem; border-radius: 3px; background: #245b43; color: #fff; font-size: .58rem; font-weight: 800; }
    .description { margin: .38rem 0 .2rem; font-size: .77rem; font-weight: 750; line-height: 1.35; }
    .product-id { margin: 0; color: #60736d; font-family: ui-monospace, monospace; font-size: .65rem; overflow-wrap: anywhere; }
    .empty-state { margin: 1rem 0 0; padding: 1.4rem .8rem; border: 1px dashed #c7d9ca; border-radius: 8px; background: #f8fbf7; color: #60736d; text-align: center; font-size: .8rem; }
    @media (min-width: 801px) and (max-width: 1199px) {
      .entry-content { display: grid; grid-template-columns: minmax(11.5rem, .85fr) minmax(0, 1.6fr) minmax(10rem, .9fr); align-items: center; gap: 1rem; }
      .description { margin: 0; }
    }
    @media (min-width: 1200px) {
      section { display: flex; flex-direction: column; }
      .empty-state { margin: auto 0; }
    }
    @supports (-moz-appearance: none) { .entries { scrollbar-color: #559174 #dbe8de; scrollbar-width: thin; } }
  `,
})
export class EventLog {
  readonly events = input.required<readonly LineEvent[]>();
  protected readonly recentEvents = computed(() => this.events().slice(0, 20));
}
