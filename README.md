# Lafayette Equipment Rentals - Next.js Application

A modern, responsive equipment rental website built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Server-Side Rendering**: Next.js 15 with App Router
- **Content Management**: Static/local data (Sanity removed)
- **Theme System**: Customizable design system with CSS variables
- **Equipment Search**: Advanced filtering and search functionality
- **Contact Forms**: Email integration for quotes and inquiries

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- pnpm

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (see Environment Variables section)

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
Lafayette-nj-rentals-homepage/
├── app/                    # Next.js App Router pages
│   ├── company/           # Company-related pages
│   │   └── about/         # About page (formerly /about)
│   ├── support/           # Support and help pages
│   │   └── faq/          # FAQ page (formerly /faq)
│   ├── equipment-rental/  # Equipment rental pages
│   ├── industries/        # Industry-specific pages
│   ├── blog/             # Blog pages
│   ├── contact/          # Contact page
│   └── api/              # API routes
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (buttons, cards, etc.)
│   └── ...               # Feature-specific components
├── lib/                  # Utility functions and configurations
├── styles/               # Global styles and theme configuration
│   ├── theme.ts          # Theme configuration
│   └── theme.env.example # Environment variables reference
└── public/               # Static assets
```

## Theming & Structure

### Theme Configuration

The application uses a comprehensive theming system that supports both light and dark modes, with customizable colors and fonts.

#### Adding New Colors or Fonts

1. **Environment Variables**: Add new theme variables to your `.env.local` file:

   ```env
   NEXT_PUBLIC_PRIMARY_COLOR=hsl(220 14% 96%)
   NEXT_PUBLIC_SECONDARY_COLOR=hsl(220 13% 91%)
   NEXT_PUBLIC_PRIMARY_FONT=Inter, sans-serif
   ```

2. **Theme File**: The theme is defined in `styles/theme.ts`:

   ```typescript
   export const theme: Theme = {
     colors: {
       primaryColor:
         process.env.NEXT_PUBLIC_PRIMARY_COLOR || "hsl(var(--primary))",
       // ... other colors
     },
     fonts: {
       primaryFont:
         process.env.NEXT_PUBLIC_PRIMARY_FONT ||
         "var(--font-inter), Inter, sans-serif",
       // ... other fonts
     },
   };
   ```

3. **CSS Variables**: The theme automatically generates CSS variables that can be used in components:
   ```css
   .my-component {
     color: var(--primary);
     font-family: var(--font-primary);
   }
   ```

#### Theme Utility Classes

The application includes custom utility classes for consistent theming:

- **Colors**: `.text-theme-primary`, `.bg-theme-primary`, `.border-theme-primary`
- **Badges**: `.badge-theme-primary`, `.badge-theme-secondary`
- **Hover States**: `.hover:text-theme-primary`, `.group-hover:text-theme-primary`

### Route Structure

The application follows a logical route structure:

- **Company Pages**: `/company/about` - Company information
- **Support Pages**: `/support/faq` - Help and support
- **Equipment**: `/equipment-rental/[category]/[equipment]` - Equipment listings
- **Industries**: `/industries/[industry]` - Industry-specific pages
- **Blog**: `/blog/[slug]` - Blog articles

#### Creating New Routes

1. **Company Routes**: Add pages under `app/company/` for company-related content
2. **Support Routes**: Add pages under `app/support/` for help and support content
3. **Dynamic Routes**: Use `[slug]` or `[id]` for dynamic parameters

### Component System

#### Using Button Components

```typescript
import { Button } from "@/components/ui/button";

// Different variants
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
```

#### Using Card Components

```typescript
import { Card, CardHeader, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>;
```

#### Using Badge Components

```typescript
import { Badge } from "@/components/ui/badge";

// Standard variants
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>

// Custom theme variants
<Badge className="badge-theme-primary">Theme Primary</Badge>
<Badge className="badge-theme-secondary">Theme Secondary</Badge>
```

## Environment Variables

Copy the reference file and customize for your environment:

```bash
cp styles/theme.env.example .env.local
```

Required variables:

- Sanity variables no longer required
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - reCAPTCHA site key for forms

Optional theme variables:

- `NEXT_PUBLIC_PRIMARY_COLOR` - Primary brand color
- `NEXT_PUBLIC_SECONDARY_COLOR` - Secondary brand color
- `NEXT_PUBLIC_PRIMARY_FONT` - Primary font family
- And more... (see `styles/theme.env.example`)

## Development

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Component-based architecture

### Adding New Features

1. Create components in `components/`
2. Use existing UI components from `components/ui/`
3. Follow the established theming system
4. Update this README if adding new configuration options

### Testing

Run the build to ensure everything works:

```bash
npm run build
```

## Deployment

The application is configured for deployment on Vercel:

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Support

For questions or issues:

1. Check the FAQ at `/support/faq`
2. Review the documentation above
3. Contact the development team

## License

[Add your license information here]
