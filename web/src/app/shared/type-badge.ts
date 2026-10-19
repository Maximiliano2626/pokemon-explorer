import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TypeLabelPipe } from './pokemon-format';

@Component({
  selector: 'app-type-badge',
  imports: [TypeLabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"type-" + type()' },
  template: `{{ type() | typeLabel }}`,
  styles: `
    :host {
      display: inline-block;
      padding: 0.2rem 0.7rem;
      border-radius: 999px;
      background: var(--type-color, var(--muted));
      color: #fff;
      font-size: 0.8125rem;
      font-weight: 700;
      letter-spacing: 0.01em;
    }
  `,
})
export class TypeBadge {
  readonly type = input.required<string>();
}