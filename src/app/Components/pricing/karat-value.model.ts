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
    period: number; // Period in months (e.g., 6, 12, 24)
}

export interface Karat {
    karatId: number;
    karatValue: number; // Gold purity (e.g., 18, 22, 24)
}

export interface CreatePricing {
    price: number; // The price offering for this combination of Karat and LoanPeriod
    karatId: number; // Selected Karat ID
    loanPeriodId: number; // Selected Loan Period ID
}

export interface PricingBatchDTO {
    price: number; // The price offering for this combination of Karat and LoanPeriod
    karatValue: number; // Karat value - will create if doesn't exist
    period: number; // Period in months - will create if doesn't exist
}

export interface EditPricing {
    price: number; // The price to be updated
}

// DTOs for creation based on API documentation
export interface KaratDTO {
    karatValue: number; // Required for creation
}

export interface LoanPeriodDTO {
    period: number; // Required for creation - period in months
}

export interface PricingDTO {
    price: number; // Required
    karatId: number; // Required - must exist
    loanPeriodId: number; // Required - must exist
}

export interface PricingPutDTO {
    price: number; // Required - new price value
}


