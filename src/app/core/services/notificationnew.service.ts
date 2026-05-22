import {
  Injectable,
  ComponentRef,
  Injector,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationComponent } from 'src/app/website/notification/notification.component';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private activeNotifications: ComponentRef<NotificationComponent>[] = [];
  private notificationHosts: HTMLElement[] = [];

  constructor(
    private appRef: ApplicationRef,
    private environmentInjector: EnvironmentInjector
  ) {}

  show(
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
    duration: number = 3000
  ): void {
    // Create a DOM element to host our component
    const notificationHost = document.createElement('div');
    document.body.appendChild(notificationHost);
    this.notificationHosts.push(notificationHost);

    // Create the notification component
    const notificationComponentRef = createComponent(NotificationComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: notificationHost,
    });

    // Set the input properties
    const instance = notificationComponentRef.instance;
    instance.message = message;
    instance.type = type;
    instance.duration = duration;

    // Listen for the closed event
    instance.closed.subscribe(() => {
      this.removeNotification(notificationComponentRef, notificationHost);
    });

    // Attach to the application change detection mechanism
    this.appRef.attachView(notificationComponentRef.hostView);

    // Add to active notifications
    this.activeNotifications.push(notificationComponentRef);

    // Set a backup timeout in case the closed event doesn't fire
    setTimeout(() => {
      this.removeNotification(notificationComponentRef, notificationHost);
    }, duration + 500);
  }

  private removeNotification(
    componentRef: ComponentRef<NotificationComponent>,
    hostElement: HTMLElement
  ): void {
    const index = this.activeNotifications.indexOf(componentRef);
    if (index > -1) {
      this.activeNotifications.splice(index, 1);

      // Safely remove from DOM only if it's still in the document
      try {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();

        const hostIndex = this.notificationHosts.indexOf(hostElement);
        if (hostIndex > -1) {
          this.notificationHosts.splice(hostIndex, 1);
        }

        if (document.body.contains(hostElement)) {
          document.body.removeChild(hostElement);
        }
      } catch (error) {
        console.warn('Error cleaning up notification:', error);
      }
    }
  }
}
