import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeMode>('dark');
  public theme$ = this.themeSubject.asObservable();

  get currentTheme(): ThemeMode {
    return this.themeSubject.value;
  }

  toggleTheme() {
    this.themeSubject.next(this.themeSubject.value === 'dark' ? 'light' : 'dark');
  }
}
