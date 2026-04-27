import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class AppCardComponent {
  @Input() padding?: string = '25px';
  @Input() borderRadius?: string = '20px';
  @Input() customClass?: string;
  @Input() showHeader?: boolean = false;
  @Input() title?: string;
  @Input() showActions?: boolean = false;
}
