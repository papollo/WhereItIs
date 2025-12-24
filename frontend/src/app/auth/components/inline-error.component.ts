import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-inline-error',
  standalone: true,
  imports: [NgIf],
  template: `
    <p class="inline-error" role="alert" *ngIf="message">{{ message }}</p>
  `,
  styles: [
    `
      .inline-error {
        margin: 0;
        font-size: 13px;
        color: #b3261e;
      }
    `,
  ],
})
export class InlineErrorComponent {
  @Input() message = '';
}
