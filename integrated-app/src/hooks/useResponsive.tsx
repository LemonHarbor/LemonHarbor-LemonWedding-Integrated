import React from 'react';
import { useMediaQuery } from 'react-responsive';

// Responsive Design Hooks für verschiedene Bildschirmgrößen
export function useResponsive() {
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const isTablet = useMediaQuery({ minWidth: 640, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isLargeDesktop = useMediaQuery({ minWidth: 1280 });
  
  // Spezifische Breakpoints für bestimmte Komponenten
  const isSmallMobile = useMediaQuery({ maxWidth: 375 });
  const isLandscape = useMediaQuery({ orientation: 'landscape' });
  const isPortrait = useMediaQuery({ orientation: 'portrait' });
  const hasTouchScreen = useMediaQuery({ query: '(hover: none) and (pointer: coarse)' });
  const prefersReducedMotion = useMediaQuery({ query: '(prefers-reduced-motion: reduce)' });
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isSmallMobile,
    isLandscape,
    isPortrait,
    hasTouchScreen,
    prefersReducedMotion,
    
    // Hilfsfunktionen für bedingte Styles
    getResponsiveValue: (options) => {
      if (isMobile && options.mobile !== undefined) return options.mobile;
      if (isTablet && options.tablet !== undefined) return options.tablet;
      if (isDesktop && options.desktop !== undefined) return options.desktop;
      if (isLargeDesktop && options.largeDesktop !== undefined) return options.largeDesktop;
      return options.default;
    },
    
    // Hilfsfunktionen für bedingte Klassen
    getResponsiveClasses: (baseClasses, responsiveClasses) => {
      let classes = baseClasses || '';
      
      if (isMobile && responsiveClasses.mobile) {
        classes += ' ' + responsiveClasses.mobile;
      }
      
      if (isTablet && responsiveClasses.tablet) {
        classes += ' ' + responsiveClasses.tablet;
      }
      
      if (isDesktop && responsiveClasses.desktop) {
        classes += ' ' + responsiveClasses.desktop;
      }
      
      if (isLargeDesktop && responsiveClasses.largeDesktop) {
        classes += ' ' + responsiveClasses.largeDesktop;
      }
      
      return classes.trim();
    }
  };
}

// Responsive Container Komponente
export const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const { getResponsiveClasses } = useResponsive();
  
  const containerClasses = getResponsiveClasses(
    `container mx-auto px-4 ${className}`,
    {
      mobile: 'py-4',
      tablet: 'py-6',
      desktop: 'py-8',
      largeDesktop: 'py-10'
    }
  );
  
  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

// Responsive Grid Komponente
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    largeDesktop?: number;
  };
  gap?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    largeDesktop?: string;
  };
}> = ({ 
  children, 
  className = '',
  columns = { mobile: 1, tablet: 2, desktop: 3, largeDesktop: 4 },
  gap = { mobile: 'gap-4', tablet: 'gap-6', desktop: 'gap-8', largeDesktop: 'gap-10' }
}) => {
  const { getResponsiveClasses } = useResponsive();
  
  const gridClasses = getResponsiveClasses(
    `grid ${className}`,
    {
      mobile: `grid-cols-${columns.mobile} ${gap.mobile}`,
      tablet: `sm:grid-cols-${columns.tablet} ${gap.tablet}`,
      desktop: `lg:grid-cols-${columns.desktop} ${gap.desktop}`,
      largeDesktop: `xl:grid-cols-${columns.largeDesktop} ${gap.largeDesktop}`
    }
  );
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// Responsive Text Komponente
export const ResponsiveText: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small';
}> = ({ 
  children, 
  className = '',
  variant = 'body'
}) => {
  const { getResponsiveClasses } = useResponsive();
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'h1':
        return getResponsiveClasses(
          'font-bold',
          {
            mobile: 'text-2xl',
            tablet: 'sm:text-3xl',
            desktop: 'lg:text-4xl',
            largeDesktop: 'xl:text-5xl'
          }
        );
      case 'h2':
        return getResponsiveClasses(
          'font-semibold',
          {
            mobile: 'text-xl',
            tablet: 'sm:text-2xl',
            desktop: 'lg:text-3xl',
            largeDesktop: 'xl:text-4xl'
          }
        );
      case 'h3':
        return getResponsiveClasses(
          'font-medium',
          {
            mobile: 'text-lg',
            tablet: 'sm:text-xl',
            desktop: 'lg:text-2xl',
            largeDesktop: 'xl:text-3xl'
          }
        );
      case 'h4':
        return getResponsiveClasses(
          'font-medium',
          {
            mobile: 'text-base',
            tablet: 'sm:text-lg',
            desktop: 'lg:text-xl',
            largeDesktop: 'xl:text-2xl'
          }
        );
      case 'small':
        return getResponsiveClasses(
          '',
          {
            mobile: 'text-xs',
            tablet: 'sm:text-sm',
            desktop: 'lg:text-sm',
            largeDesktop: 'xl:text-base'
          }
        );
      case 'body':
      default:
        return getResponsiveClasses(
          '',
          {
            mobile: 'text-sm',
            tablet: 'sm:text-base',
            desktop: 'lg:text-base',
            largeDesktop: 'xl:text-lg'
          }
        );
    }
  };
  
  const textClasses = `${getVariantClasses()} ${className}`;
  
  return (
    <div className={textClasses}>
      {children}
    </div>
  );
};

export default useResponsive;
