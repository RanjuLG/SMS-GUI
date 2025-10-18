import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarExpandedSubject = new BehaviorSubject<boolean>(true);
  public sidebarExpanded$ = this.sidebarExpandedSubject.asObservable();

  constructor() {
    // Load initial state from localStorage
    const savedState = localStorage.getItem('sidebarExpanded');
    if (savedState !== null) {
      this.sidebarExpandedSubject.next(JSON.parse(savedState));
    }
  }

  toggleSidebar(): void {
    const currentState = this.sidebarExpandedSubject.value;
    const newState = !currentState;
    this.setSidebarState(newState);
  }

  setSidebarState(expanded: boolean): void {
    this.sidebarExpandedSubject.next(expanded);
    localStorage.setItem('sidebarExpanded', JSON.stringify(expanded));
    
    // Force DOM update for mobile devices
    setTimeout(() => {
      this.updateMobileSidebarDOM(expanded);
    }, 10);
  }

  getSidebarState(): boolean {
    return this.sidebarExpandedSubject.value;
  }

  private updateMobileSidebarDOM(expanded: boolean): void {
    if (window.innerWidth <= 991.98) {
      const sidebarWrapper = document.querySelector('.sidebar-wrapper');
      const overlay = document.querySelector('.sidebar-overlay');
      const sidebarElement = document.querySelector('.modern-sidebar');
      
      if (sidebarWrapper) {
        if (expanded) {
          sidebarWrapper.classList.add('sidebar-expanded');
        } else {
          sidebarWrapper.classList.remove('sidebar-expanded');
        }
      }
      
      if (overlay) {
        if (expanded) {
          overlay.classList.add('show');
        } else {
          overlay.classList.remove('show');
        }
      }
      
      if (sidebarElement) {
        if (expanded) {
          sidebarElement.classList.add('expanded');
        } else {
          sidebarElement.classList.remove('expanded');
        }
      }
    }
  }

  // Method to handle mobile-specific state updates
  public forceMobileUpdate(): void {
    if (window.innerWidth <= 991.98) {
      const currentState = this.getSidebarState();
      this.updateMobileSidebarDOM(currentState);
    }
  }

  // Method to close sidebar on mobile when clicking outside
  public closeMobileSidebar(): void {
    if (window.innerWidth <= 991.98 && this.getSidebarState()) {
      this.setSidebarState(false);
    }
  }
}
