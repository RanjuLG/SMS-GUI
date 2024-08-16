export interface Pricing {
    pricingId: number;
    price: number; // The price offering for this combination of Karat and LoanPeriod
    karatId: number;
    loanPeriodId: number;

    // Navigation properties
    karat?: Karat;
    loanPeriod?: LoanPeriod;
}

export interface LoanPeriod {
    loanPeriodId: number;
    period: string; // e.g., "30 Days", "60 Days"
    pricings?: Pricing[];
}

export interface Karat {
    karatId: number;
    karatValue: string;
    pricings?: Pricing[];
}
