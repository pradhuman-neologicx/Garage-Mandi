import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: [
    trigger('slideInOut', [
      state(
        'void',
        style({
          transform: 'translateX(100%)',
          opacity: 0,
        })
      ),
      state(
        '*',
        style({
          transform: 'translateX(0)',
          opacity: 1,
        })
      ),
      transition('void => *', animate('300ms ease-out')),
      transition('* => void', animate('300ms ease-in')),
    ]),
  ],
})
export class NotificationComponent implements OnInit {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'info' = 'success';
  @Input() duration: number = 3000;
  @Output() closed = new EventEmitter<void>();

  visible: boolean = true;

  ngOnInit(): void {
    setTimeout(() => {
      this.visible = false;
      this.closed.emit();
    }, this.duration);
  }
}
