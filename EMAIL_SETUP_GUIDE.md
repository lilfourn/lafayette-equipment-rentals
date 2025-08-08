# Email Service Setup Guide

## Overview

All forms on the Lafayette Equipment Rentals website are properly connected to the email service. This guide will help you configure the email functionality to ensure both business notifications and customer confirmations are sent.

## Forms Connected to Email Service

✅ **Contact Form** (`/contact`) - Sends contact inquiries
✅ **No Results Form** (`/components/no-results.tsx`) - Sends equipment search requests  
✅ **Cart Checkout** (`/cart`) - Sends booking confirmations
✅ **Multi-step Checkout Modal** - Sends booking confirmations
✅ **Booking Modal** - Sends equipment rental requests
✅ **Buy It Now Modal** - Sends purchase inquiries

## Email Configuration

### 1. Create Environment File

Create a `.env.local` file in the root directory with the following variables:

```env
# Email Server Configuration (ImprovMX recommended)
EMAIL_HOST=mail.improvmx.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@Lafayetteequipmentrentals.com
EMAIL_PASS=your-email-password

# Business Email Address (where notifications are sent)
BUSINESS_EMAIL=info@Lafayetteequipmentrentals.com

# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production

# ReCAPTCHA (if needed)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

### 2. Email Service Setup

#### Option A: ImprovMX (Recommended)

1. Sign up for ImprovMX at https://improvmx.com
2. Add your domain (Lafayetteequipmentrentals.com)
3. Create email forwarding rules
4. Use the SMTP credentials provided by ImprovMX

#### Option B: Gmail SMTP

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

#### Option C: Custom SMTP Server

```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

## Email Recipients

### Business Notifications

Emails are sent to:

- `info@Lafayetteequipmentrentals.com` (primary business email)
- `adam@rubbl.com` (Rubbl team)
- `jenna@rubbl.com` (Rubbl team)
- `BUSINESS_EMAIL` environment variable

### Customer Confirmations

- All customers receive confirmation emails
- Reply-to is set to business email for easy response

## Email Types

### 1. Contact Form (`type: 'contact'`)

- **Business Email**: Contact form submission details
- **Customer Email**: Confirmation of message received

### 2. Equipment Search (`type: 'no-results'`)

- **Business Email**: Equipment request details
- **Customer Email**: Confirmation of search request

### 3. Equipment Booking (`type: 'booking'`)

- **Business Email**: Detailed booking information with equipment, dates, pricing
- **Customer Email**: Booking confirmation with next steps

### 4. Buy It Now (`type: 'buy-now'`)

- **Business Email**: Purchase inquiry with equipment details
- **Customer Email**: Purchase request confirmation

## Testing the Email Service

### Development Mode

In development, emails are simulated and logged to console:

```bash
npm run dev
```

Check the console for email simulation logs.

### Production Testing

1. Set up environment variables
2. Submit a test form
3. Check both business and customer email inboxes

## Troubleshooting

### Common Issues

1. **"Email service not configured"**

   - Check that `.env.local` file exists
   - Verify all email environment variables are set

2. **"SMTP Error"**

   - Verify SMTP credentials
   - Check firewall/network settings
   - Try different SMTP port (587 vs 465)

3. **Emails not received**
   - Check spam folder
   - Verify email addresses are correct
   - Check SMTP server logs

### Debug Mode

The email API includes comprehensive logging:

- Development mode shows email simulation
- Production mode logs SMTP errors
- All form submissions are logged

## Security Notes

- Never commit `.env.local` to version control
- Use app passwords for Gmail (not regular passwords)
- Consider using environment-specific email services
- Monitor email sending limits

## Form Validation

All forms include:

- Email format validation
- Phone number formatting
- Required field validation
- Error handling and user feedback

## Next Steps

1. Create `.env.local` file with your email credentials
2. Test each form type in development
3. Deploy to production with proper environment variables
4. Monitor email delivery and spam folder placement
5. Set up email monitoring/alerts if needed

## Support

For email service issues:

1. Check console logs for detailed error messages
2. Verify environment variables are correctly set
3. Test SMTP credentials with a simple email client
4. Contact your email service provider for support
