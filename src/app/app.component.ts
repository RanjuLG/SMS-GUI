import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavBarComponent } from "./Components/nav-bar/nav-bar.component";
import { FooterComponent } from './Components/footer/footer.component';
import { AuthService } from './Services/auth.service';
import { ThemeService } from './Services/theme.service';
import { BreadcrumbService } from './Services/breadcrumb.service';
import { SidebarService } from './Services/sidebar.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './Components/sidebar/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    NavBarComponent,
    FooterComponent,
    CommonModule,
    SidebarComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'SMS';
  isLoggedIn = false;
  sidebarExpanded = true;
  isLoading = false;
  loadingMessage = 'Loading...';
  isCashierMode = false;
  
  private sidebarSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private breadcrumbService: BreadcrumbService,
    public sidebarService: SidebarService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialize theme service
    this.themeService.initializeTheme();
    
    // Initialize breadcrumb service (it will start listening to route changes automatically)
    // No explicit initialization needed as the service starts listening in constructor
    
    this.isLoggedIn = this.authService.isLoggedIn;
    console.log("this.isLoggedIn: ", this.isLoggedIn);
    
    this.authService.authStatus.subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });

    // Subscribe to sidebar state changes
    this.sidebarSubscription = this.sidebarService.sidebarExpanded$.subscribe(
      (expanded: boolean) => {
        this.sidebarExpanded = expanded;
      }
    );

    // Listen for route changes to detect cashier mode
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isCashierMode = event.url.includes('/cashier');
      });

    // Initial check for cashier mode
    this.isCashierMode = this.router.url.includes('/cashier');
  }

  ngOnDestroy() {
    this.sidebarSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  onSidebarToggle(expanded: boolean) {
    this.sidebarService.setSidebarState(expanded);
  }

  // Helper method for closing mobile sidebar from overlay click
  closeMobileSidebar() {
    this.sidebarService.closeMobileSidebar();
  }

  showLoading(message: string = 'Loading...') {
    this.loadingMessage = message;
    this.isLoading = true;
  }

  hideLoading() {
    this.isLoading = false;
  }
}
