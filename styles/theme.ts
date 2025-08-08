import type React from "react";

export interface Theme {
  colors: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    foregroundColor: string;
    borderColor: string;
    mutedColor: string;
    destructiveColor: string;
    cardColor: string;
    inputColor: string;
    ringColor: string;
  };
  fonts: {
    primaryFont: string;
    secondaryFont: string;
    headingFont: string;
  };
  spacing: {
    radius: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
}

// Use a function to get the theme to avoid build-time evaluation issues
export const getTheme = (): Theme => ({
  colors: {
    primaryColor: 'hsl(var(--primary))',
    secondaryColor: 'hsl(var(--secondary))',
    accentColor: 'hsl(var(--accent))',
    backgroundColor: 'hsl(var(--background))',
    foregroundColor: 'hsl(var(--foreground))',
    borderColor: 'hsl(var(--border))',
    mutedColor: 'hsl(var(--muted))',
    destructiveColor: 'hsl(var(--destructive))',
    cardColor: 'hsl(var(--card))',
    inputColor: 'hsl(var(--input))',
    ringColor: 'hsl(var(--ring))',
  },
  fonts: {
    primaryFont: 'var(--font-inter), Inter, sans-serif',
    secondaryFont: 'Arial, Helvetica, sans-serif',
    headingFont: 'var(--font-inter), Inter, sans-serif',
  },
  spacing: {
    radius: 'var(--radius)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
});

// Export a default theme object for backward compatibility
export const theme = getTheme();

// CSS Variables helper for dynamic theming
export const getCSSVariables = (theme: Theme): React.CSSProperties => ({
  '--primary': theme.colors.primaryColor,
  '--secondary': theme.colors.secondaryColor,
  '--accent': theme.colors.accentColor,
  '--background': theme.colors.backgroundColor,
  '--foreground': theme.colors.foregroundColor,
  '--border': theme.colors.borderColor,
  '--muted': theme.colors.mutedColor,
  '--destructive': theme.colors.destructiveColor,
  '--card': theme.colors.cardColor,
  '--input': theme.colors.inputColor,
  '--ring': theme.colors.ringColor,
  '--font-primary': theme.fonts.primaryFont,
  '--font-secondary': theme.fonts.secondaryFont,
  '--font-heading': theme.fonts.headingFont,
  '--radius': theme.spacing.radius,
} as React.CSSProperties);

// Utility function to generate Tailwind classes - Fixed for Tailwind purging
export const getThemeClasses = (theme: Theme) => ({
  // Use explicit class names that Tailwind can detect
  primary: 'text-primary',
  secondary: 'text-secondary', 
  accent: 'text-accent',
  background: 'bg-background',
  foreground: 'text-foreground',
  border: 'border-border',
  muted: 'text-muted',
  destructive: 'text-destructive',
});

// If you need the actual color values, use CSS variables instead
export const getThemeClassNames = () => ({
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  background: 'bg-background',
  foreground: 'text-foreground',
  border: 'border-border',
  muted: 'text-muted-foreground',
  destructive: 'text-destructive',
  card: 'bg-card text-card-foreground',
  popover: 'bg-popover text-popover-foreground',
});

export default theme; 