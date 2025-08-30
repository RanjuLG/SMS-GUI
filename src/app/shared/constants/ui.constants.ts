export const UI_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 15, 20, 50]
  },
  ANIMATIONS: {
    FADE_DURATION: 300,
    SLIDE_DURATION: 400
  },
  BREAKPOINTS: {
    MOBILE: 576,
    TABLET: 768,
    DESKTOP: 992,
    LARGE_DESKTOP: 1200
  },
  COLORS: {
    PRIMARY: '#3d78e3',
    SECONDARY: '#6559cc',
    SUCCESS: '#67b173',
    WARNING: '#ffc84b',
    DANGER: '#f17171',
    INFO: '#29badb',
    GOLD: '#ecc766',
    BLUE: '#0e2c60'
  }
} as const;

export const FORM_VALIDATION = {
  EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE_PATTERN: /^[0-9]{10}$/,
  NIC_PATTERN: /^([0-9]{9}[x|X|v|V]|[0-9]{12})$/
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'yyyy-MM-dd',
  API: 'yyyy-MM-dd',
  LONG: 'MMMM dd, yyyy'
} as const;
