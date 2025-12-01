import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  isLoading = signal(false);
  message = signal<string>('Loading...');

  show(msg: string = 'Loading...') {
    this.message.set(msg);
    this.isLoading.set(true);
  }

  hide() {
    this.isLoading.set(false);
  }
}
