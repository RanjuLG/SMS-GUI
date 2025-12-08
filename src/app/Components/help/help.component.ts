import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

interface FAQ {
  question: string;
  answer: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent {
  faqs: FAQ[] = [
    {
      question: 'How do I reset my password?',
      answer: 'To reset your password, please contact your system administrator. They will be able to initiate the password reset process for you.'
    },
    {
      question: 'How do I create a new invoice?',
      answer: 'Navigate to the "Create Invoice" section from the dashboard or sidebar. Fill in the required customer and item details, then click "Generate Invoice".'
    },
    {
      question: 'Where can I view my transaction history?',
      answer: 'You can view your transaction history by clicking on the "Transaction History" link in the sidebar. You can filter transactions by date and type.'
    },
    {
      question: 'How do I add a new customer?',
      answer: 'Go to the "Customers" section and click on the "Add Customer" button. Fill in the customer details and save.'
    },
    {
      question: 'Who do I contact for technical support?',
      answer: 'For technical support, please email support@smsgoldcash.com or call our support line at +1-800-555-0199.'
    }
  ];

  toggleFAQ(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}
