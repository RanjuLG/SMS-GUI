import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'sms-theme';
  private currentThemeSubject = new BehaviorSubject<Theme>(this.getStoredTheme());

  constructor() {
    this.initializeTheme();
  }

  get currentTheme$(): Observable<Theme> {
    return this.currentThemeSubject.asObservable();
  }

  get currentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(this.THEME_KEY) as Theme;
    if (stored && (stored === 'light' || stored === 'dark')) {
      return stored;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  }

  initializeTheme(): void {
    this.applyTheme(this.currentTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.THEME_KEY)) {
        const systemTheme: Theme = e.matches ? 'dark' : 'light';
        this.setTheme(systemTheme);
      }
    });
  }

  setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    this.applyTheme(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light-theme', 'dark-theme');
    
    // Add new theme class
    root.classList.add(`${theme}-theme`);
    
    // Update data attribute for CSS targeting
    root.setAttribute('data-theme', theme);
    
    // Update Bootstrap theme if using Bootstrap 5.3+
    if (theme === 'dark') {
      root.setAttribute('data-bs-theme', 'dark');
    } else {
      root.setAttribute('data-bs-theme', 'light');
    }
  }

  isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }

  isLightMode(): boolean {
    return this.currentTheme === 'light';
  }
}
