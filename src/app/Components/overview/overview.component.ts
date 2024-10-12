import { Component, OnInit,AfterViewInit, ElementRef } from '@angular/core';
import {RouterLink} from '@angular/router';
import { CreateInvoiceComponent } from '../helpers/invoices/create-invoice/create-invoice.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseChartDirective } from 'ng2-charts';
import { ApiService } from '../../Services/api-service.service';
import { Overview } from '../reports/reports.model';
declare var bootstrap: any;
import { AuthService } from '../../Services/auth.service';
@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink,BaseChartDirective],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit,AfterViewInit {
  totalLoans: number = 0;
  totalInvoices: number = 0;
  totalRevenue: number = 0;
  inventoryCount: number = 0;
  customerCount: number = 0;
  userName:string = '';
  greeting:string = '';
  currentDate: string = '';

  constructor(
    private modalService: NgbModal,
    private el: ElementRef,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngAfterViewInit(): void {
    const tooltipElements = this.el.nativeElement.querySelectorAll('[data-bs-toggle="tooltip"]');
  
    tooltipElements.forEach((element: HTMLElement) => {
      const tooltip = new bootstrap.Tooltip(element, {
        placement: 'right',
        trigger: 'hover' // Use hover to show/hide tooltip on mouse events
      });
  
      element.addEventListener('click', () => {
        // If the tooltip is visible, hide it; otherwise, show it.
        if (tooltip._isShown()) {
          tooltip.hide();
        } else {
          tooltip.show();
        }
      });
  
      // Optional: Dismiss tooltip if clicked outside the element
      document.addEventListener('click', (event: MouseEvent) => {
        if (!element.contains(event.target as Node)) {
          tooltip.hide();
        }
      });
    });
  }
  

  ngOnInit(): void {
    this.getUserName();
    this.greet();
    this.updateDate();
    this.loadDashboardData();
    
    // Default to last 31 days and set the 31D button as active
    this.updateChartData('7D', 'btn-7D');
  }
  

  openCreateInvoiceModal() {
    const modalRef = this.modalService.open(CreateInvoiceComponent, { size: 'lg' });
    modalRef.result.then((result) => {
      if (result === 'submitted') {
        
      }
    }).catch((error) => {
      console.log('Create invoice modal dismissed:', error);
    });
  }

  greet() {
    const currentHour = new Date().getHours(); // Get the current hour (0-23)
  
    if (currentHour >= 3 && currentHour < 12) {
      this.greeting = 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 17) {
      this.greeting = 'Good Afternoon';
    } else if (currentHour >= 17 && currentHour < 22) {
      this.greeting = 'Good Evening';
    } else if (currentHour >= 22 || currentHour < 3) {
      this.greeting = 'Good Night';
    }
  }
  
  

getUserName(){

  const _userName = this.authService.getUserName();

  if ( _userName != false){

    this.userName = _userName.toString();
  }

}

updateDate() {
  const now = new Date();
  
  // Get day with the ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
  const day = now.getDate();
  const ordinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th'; // Covers 11th, 12th, 13th, etc.
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  const dayWithSuffix = day + ordinalSuffix(day);

  // Format the date string
  this.currentDate = now.toLocaleDateString('en-GB', {
    weekday: 'long', month: 'long', year: 'numeric'
  });

  // Append day with suffix to the final date string
  this.currentDate = `${now.toLocaleDateString('en-GB', { weekday: 'long' })}, ${dayWithSuffix} of ${now.toLocaleDateString('en-GB', { month: 'long' })} ${now.getFullYear()}`;
}










  updateChartData(range: string, buttonId: string) {
    // Switch case to update chart data based on the selected range
    switch (range) {
      case '7D':
        // Update to last 7 days data
        this.lineChartData.labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
        this.lineChartData.datasets[0].data = [800, 900, 1200, 1500, 1600, 1800, 2000];
        break;
      case '31D':
        // Update to last 31 days data
        this.lineChartData.labels = ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'];
        this.lineChartData.datasets[0].data = [1000, 1500, 1800, 2100, 2500, 2700, 3000];
        break;
      case '12M':
        // Update to last 12 months data
        this.lineChartData.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        this.lineChartData.datasets[0].data = [1000, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 7500];
        break;
      case '5Y':
        // Update to last 5 years data
        this.lineChartData.labels = ['2019', '2020', '2021', '2022', '2023'];
        this.lineChartData.datasets[0].data = [20000, 25000, 30000, 35000, 40000];
        break;
      default:
        break;
    }
  
    // Remove the 'active' class from all range buttons
    const buttons = document.querySelectorAll('.range-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
  
    // Add the 'active' class to the clicked button
    const activeButton = document.getElementById(buttonId);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }
  

 // Only the card widgets are updated
 loadDashboardData(): void {
  this.apiService.getOverview().subscribe({
    next: (data: Overview) => {
      // Update the widget values from the API response
      this.totalLoans = data.totalActiveLoans ?? 0;
      this.totalInvoices = data.totalInvoices ?? 0;
      this.totalRevenue = data.revenueGenerated ?? 0;
      this.inventoryCount = data.inventoryCount ?? 0;
      this.customerCount = data.customerCount ?? 0;
    },
    error: (err) => {
      console.error('Error fetching widget data:', err);
    }
  });
}
// Chart Data
barChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [{
    data: [120, 150, 180, 90, 200],
    label: 'Loans',
    backgroundColor: '#4e73df',  // Primary blue
    borderColor: '#4e73df',
    borderWidth: 1,
    hoverBackgroundColor: '#375a7f',
    hoverBorderColor: '#375a7f',
    borderRadius: 10,  // This will round the corners of the bars
    barPercentage: 0.8,  // Optional: adjust bar thickness (80% of the width)
    categoryPercentage: 0.9 // Optional: adjust spacing between bars (90% of category space)
  }]
};

pieChartData = {
  labels: ['Gold', 'Silver', 'Other'],
  datasets: [{
    data: [55, 30, 15],
    backgroundColor: ['#1cc88a', '#f6c23e', '#858796'],  // Green, Orange, Gray
    hoverBackgroundColor: ['#17a673', '#f4b619', '#6c757d'],
    borderColor: '#ffffff',  // White border between segments
    hoverBorderColor: '#e0e0e0',
  }]
};

lineChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [{
    data: [5000, 7000, 8000, 9000, 10000],
    label: 'Revenue',
    borderColor: '#1cc88a',  // Accent green for positive growth
    backgroundColor: '#ffa500',  // Lighter green for fill
    pointBackgroundColor: '#1cc88a',
    pointBorderColor: '#1cc88a',
    pointHoverBackgroundColor: '#ffffff',
    pointHoverBorderColor: '#17a673',
    hoverBorderColor: '#375a7f',
    borderRadius: 5,  // This will round the corners of the bars
    barPercentage: 0.8,  // Optional: adjust bar thickness (80% of the width)
    categoryPercentage: 0.9 // Optional: adjust spacing between bars (90% of category space)
  }]
};

// Chart Options
barChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Months',
        color: '#333'
      },
      grid: {
        display: false
      }
    },
    y: {
      title: {
        display: true,
        text: 'Number of Loans',
        color: '#333'
      },
      grid: {
        color: '#e0e0e0'
      },
      beginAtZero: true
    }
  }
};

pieChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#333',
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(tooltipItem: { label: string; raw: string; }) {
          return tooltipItem.label + ': ' + tooltipItem.raw + '%';
        }
      }
    }
  }
};

lineChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
      labels: {
        color: '#333'
      }
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Months',
        color: '#333'
      },
      grid: {
        display: false
      }
    },
    y: {
      title: {
        display: true,
        text: 'Revenue (Rs)',
        color: '#333'
      },
      grid: {
        
        color: '#e0e0e0'
      },
      beginAtZero: true
    }
  }
};

}
