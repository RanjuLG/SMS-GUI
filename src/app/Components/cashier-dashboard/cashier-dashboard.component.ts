import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cashier-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cashier-dashboard.component.html',
  styleUrls: ['./cashier-dashboard.component.scss']
})
export class CashierDashboardComponent implements OnInit {
  currentDate: string = '';
  currentTime: string = '';
  greeting: string = '';

  // Quick stats
  todaysTransactions: number = 0;
  todaysRevenue: number = 0;
  activeLoans: number = 0;

  constructor() {}

  ngOnInit() {
    this.updateDateTime();
    this.setGreeting();
    this.loadQuickStats();
    
    // Update time every minute
    setInterval(() => {
      this.updateDateTime();
    }, 60000);
  }

  private updateDateTime() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  private loadQuickStats() {
    // In a real application, these would come from your services
    // For now, using placeholder values
    this.todaysTransactions = 12;
    this.todaysRevenue = 45000;
    this.activeLoans = 25;
  }
}