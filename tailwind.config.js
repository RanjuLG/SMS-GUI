/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js" // add this line
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',      // Extra small devices
        'sm': '640px',      // Small devices (landscape phones)
        'md': '768px',      // Medium devices (tablets)
        'lg': '1024px',     // Large devices (laptops)
        'xl': '1280px',     // Extra large devices (desktops)
        '2xl': '1536px',    // 2X large devices (large desktops)
        
        // Custom breakpoints for specific device sizes
        'mobile': {'max': '767px'}, // Mobile-first max-width
        'tablet': {'min': '768px', 'max': '1023px'}, // Tablet only
        'desktop': {'min': '1024px'}, // Desktop and up
        'touch': {'max': '1023px'}, // Touch devices (mobile + tablet)
        
        // Orientation-based breakpoints
        'portrait': {'raw': '(orientation: portrait)'},
        'landscape': {'raw': '(orientation: landscape)'},
        
        // Device-specific breakpoints
        'iphone': {'raw': '(max-width: 428px)'},
        'ipad': {'raw': '(min-width: 768px) and (max-width: 1024px)'},
        'ipad-pro': {'raw': '(min-width: 1024px) and (max-width: 1366px)'},
      },
      
      spacing: {
        '18': '4.5rem',    // 72px
        '88': '22rem',     // 352px
        '128': '32rem',    // 512px
        '144': '36rem',    // 576px
        'mobile-safe': 'env(safe-area-inset-bottom)',
        'status-bar': 'env(safe-area-inset-top)',
      },
      
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.75rem' }], // 10px
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }], // 11px
        'mobile-xs': ['0.75rem', { lineHeight: '1rem' }], // 12px mobile
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px mobile
        'mobile-base': ['1rem', { lineHeight: '1.5rem' }], // 16px mobile
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px mobile
      },
      
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'touch-target': '44px', // Minimum touch target size
        'mobile-header': '60px',
        'tablet-header': '70px',
        'desktop-header': '80px',
      },
      
      maxWidth: {
        'mobile': '100%',
        'tablet': '768px',
        'content': '1200px',
        'reading': '65ch', // Optimal reading width
      },
      
      zIndex: {
        'modal': '1050',
        'overlay': '1040',
        'sidebar': '1030',
        'navbar': '1020',
        'tooltip': '1060',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.4s ease-in-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      },
      
      boxShadow: {
        'mobile': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'tablet': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'card-mobile': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'sidebar': '2px 0 10px rgba(0, 0, 0, 0.1)',
        'navbar': '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      
      borderRadius: {
        'mobile': '0.75rem', // 12px for mobile cards
        'touch': '0.5rem',   // 8px for touch elements
      },
      
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      
      backdropBlur: {
        'xs': '2px',
      },
      
      colors: {
        // Add custom colors for better mobile theming
        'touch-target': 'rgba(0, 0, 0, 0.04)',
        'touch-active': 'rgba(0, 0, 0, 0.08)',
        'overlay-dark': 'rgba(0, 0, 0, 0.5)',
        'overlay-light': 'rgba(255, 255, 255, 0.9)',
      }
    },
  },
  plugins: [
    require('flowbite/plugin'),
    
    // Custom mobile-first utilities plugin
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Touch-friendly utilities
        '.touch-target': {
          minWidth: '44px',
          minHeight: '44px',
        },
        '.touch-target-lg': {
          minWidth: '48px',
          minHeight: '48px',
        },
        
        // Safe area utilities
        '.pt-safe': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.pb-safe': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.pl-safe': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.pr-safe': {
          paddingRight: 'env(safe-area-inset-right)',
        },
        
        // Mobile-specific utilities
        '.scroll-smooth-mobile': {
          '-webkit-overflow-scrolling': 'touch',
          'scrollbar-width': 'thin',
        },
        '.tap-highlight-none': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.font-smooth': {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        },
        
        // Overflow utilities for mobile
        '.overscroll-contain': {
          'overscroll-behavior': 'contain',
        },
        '.overscroll-none': {
          'overscroll-behavior': 'none',
        },
        
        // Mobile card utilities
        '.card-mobile': {
          borderRadius: theme('borderRadius.mobile'),
          boxShadow: theme('boxShadow.mobile'),
          marginBottom: theme('spacing.4'),
        },
        
        // Mobile input utilities
        '.input-mobile': {
          fontSize: '16px', // Prevent zoom on iOS
          minHeight: theme('minHeight.touch-target'),
        },
        
        // Mobile button utilities
        '.btn-mobile': {
          minHeight: theme('minHeight.touch-target'),
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          fontSize: theme('fontSize.mobile-sm[0]'),
          lineHeight: theme('fontSize.mobile-sm[1].lineHeight'),
        },
        
        // Mobile text utilities
        '.text-mobile-xs': {
          fontSize: theme('fontSize.mobile-xs[0]'),
          lineHeight: theme('fontSize.mobile-xs[1].lineHeight'),
        },
        '.text-mobile-sm': {
          fontSize: theme('fontSize.mobile-sm[0]'),
          lineHeight: theme('fontSize.mobile-sm[1].lineHeight'),
        },
        '.text-mobile-base': {
          fontSize: theme('fontSize.mobile-base[0]'),
          lineHeight: theme('fontSize.mobile-base[1].lineHeight'),
        },
        '.text-mobile-lg': {
          fontSize: theme('fontSize.mobile-lg[0]'),
          lineHeight: theme('fontSize.mobile-lg[1].lineHeight'),
        },
      }
      
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
}