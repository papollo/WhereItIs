import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-form-card',
  standalone: true,
  imports: [NgIf],
  templateUrl: './auth-form-card.component.html',
  styleUrls: ['./auth-form-card.component.scss'],
})
export class AuthFormCardComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle?: string;
  @Input() showFooter = true;
}
