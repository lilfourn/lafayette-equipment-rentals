# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is the Lafayette Equipment Rentals website - an equipment rental company located at:

- **Address**: 2865 Ambassador Caffery Pkwy, Ste 135, Lafayette, LA 70506, United States
- **Important Note**: UI/UX will be redesigned but functionality should remain intact

## Tech Stack

- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme system
- **UI Components**: shadcn/ui (Radix UI based)
- **CMS**: None (Sanity removed)
- **Package Manager**: pnpm (v10.13.1)
- **Forms**: React Hook Form with Zod validation
- **Email**: Nodemailer for contact forms

## Key Commands

```bash
# Development
pnpm dev              # Start development server (http://localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run linting (currently ignored in builds)

# Package Management
pnpm install          # Install dependencies
pnpm add <package>    # Add new dependency
```

## Project Architecture

### Route Structure

- `/app/` - Next.js App Router pages
  - `/equipment-rental/` - Equipment browsing and details
  - `/equipment-rental/[categoryName]/` - Category listings
  - `/equipment-rental/[categoryName]/[equipmentSlug]/` - Equipment detail pages
  - `/industries/` - Industry-specific content
  - `/blog/` - Blog
  - `/contact/` - Contact forms with email integration
  - `/about/`, `/support/faq/` - Static content pages

### Data Flow

1. **APIs/Local modules** → Provide equipment and content data
2. **Server Components** → Fetch from APIs/local modules
3. **Client Components** → Handle interactivity (filters, modals, forms)
4. **API Routes** → Handle form submissions and email sending

### Key Libraries & Patterns

#### Content

- Dynamic content sourced from APIs or local data modules

#### Component Architecture

- **Server Components**: Default for all pages (data fetching)
- **Client Components**: Prefixed files or "use client" directive
  - Filter sidebar, modals, forms, interactive elements
- **UI Components**: Base components in `/components/ui/` (shadcn/ui)

#### Styling System

- **Tailwind Config**: Extended with custom animations and theme colors
- **CSS Variables**: Dynamic theming via CSS custom properties
- **Theme Provider**: Dark/light mode support via next-themes

## Common Development Tasks

### Adding New Equipment Categories

1. Update Sanity schema for new category
2. Create route: `/app/equipment-rental/[new-category]/page.tsx`
3. Update navigation dropdowns in header components

### Modifying Email Templates

- Email logic in `/app/api/send-email/route.ts`
- Contact form validation in `/lib/validation.ts`
- Form components use React Hook Form + Zod

### Working with Filters

- Server-side data in page components
- Client-side filtering via `client-filter-sidebar.tsx`
- URL params sync for shareable filtered views

### Image Optimization

- Next.js Image component with `unoptimized: true` (configured)
- Azure Blob Storage domain allowed for remote images

## Environment Variables

Required in `.env.local`:

```env
# hCaptcha for forms
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=<your-site-key>
HCAPTCHA_SECRET_KEY=<your-secret-key>

# Email configuration
EMAIL_HOST=<smtp-host>
EMAIL_PORT=<smtp-port>
EMAIL_USER=<smtp-user>
EMAIL_PASS=<smtp-password>
EMAIL_FROM=<from-address>
EMAIL_TO=<recipient-address>
```

## Performance Considerations

- **Caching**: Aggressive caching headers configured in `next.config.mjs`
- **ISR**: Most pages use static generation with revalidation
- **Code Splitting**: Automatic via Next.js App Router
- **Bundle Size**: Monitor with `pnpm build` output

## Important Notes

- **TypeScript**: Build errors are ignored (`ignoreBuildErrors: true`)
- **ESLint**: Linting errors ignored during builds
- **Images**: Using unoptimized mode for compatibility
- **Search**: Equipment search uses client-side filtering of server data
