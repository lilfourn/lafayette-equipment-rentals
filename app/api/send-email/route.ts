import { verify } from "hcaptcha";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface EmailRequestBody {
  type: "booking" | "buy-now" | "contact" | "no-results" | "machine-contact";
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  businessName?: string;
  captchaToken?: string;

  // Equipment inquiry specific (no-results)
  equipment?: string;

  // Booking specific
  machineId?: string;
  machineName?: string;
  machineYear?: string;
  machineMake?: string;
  machineModel?: string;
  machineType?: string;
  startDate?: string;
  duration?: number;
  zipCode?: string;
  rpoInterested?: boolean;
  totalCost?: number;
  address?: string;
  city?: string;
  state?: string;
  cartItems?: Array<{
    machineId: string;
    machineName: string;
    quantity?: number;
    year?: number;
    primaryType?: string;
  }>;
  subtotal?: number;
  freePickup?: boolean;
  attachments?: Array<{
    name: string;
    make?: string;
    model?: string;
    pricing?: {
      dailyRate?: number;
      weeklyRate?: number;
      monthlyRate?: number;
    };
  }>;
  rubblUrl?: string;

  // Buy now specific / Contact specific
  buyItNowPrice?: number;
  comment?: string;
  message?: string;
  subject?: string;
}

// Helper function to format duration for display
const formatDuration = (days: number): string => {
  if (days >= 180) {
    return "6+ months";
  } else if (days >= 30) {
    const months = Math.round(days / 30);
    return `${months} month${months > 1 ? "s" : ""}`;
  } else if (days >= 7) {
    const weeks = Math.round(days / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""}`;
  } else {
    return `${days} day${days > 1 ? "s" : ""}`;
  }
};

// Helper function to format cost display
const formatCostDisplay = (cost: number, duration: number): string => {
  const isMaxDuration = duration >= 180;
  return isMaxDuration ? `$${cost.toFixed(2)}+` : `$${cost.toFixed(2)}`;
};

// Create transporter for ImprovMX with optimized settings
let transporter: any = null;

const createTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "mail.improvmx.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Enhanced settings for better deliverability
      tls: {
        rejectUnauthorized: false,
        ciphers: "SSLv3",
      },
      // Connection settings with reasonable timeouts
      connectionTimeout: 10000, // 10 seconds for connection
      greetingTimeout: 10000, // 10 seconds for greeting
      socketTimeout: 10000, // 10 seconds for socket
      // Connection pooling for better performance
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
      // Disable debug for performance
      debug: false,
      logger: false,
    });
  }
  return transporter;
};

const buildRubblMachineUrl = (data: EmailRequestBody) => {
  if (
    !data.machineId ||
    !data.machineMake ||
    !data.machineModel ||
    !data.machineType
  ) {
    return data.rubblUrl || "";
  }

  // Format city-state
  const cityState = "Lafayette-LA";

  // Clean and format the components
  const type = data.machineType.replace(/\s+/g, "-").toLowerCase();
  const make = data.machineMake.replace(/\s+/g, "-").toLowerCase();
  const model = data.machineModel.replace(/\s+/g, "-").toLowerCase();

  return `https://www.rubbl.com/equipment-rental/${cityState}/${type}/${make}/${model}?id=${data.machineId}`;
};

// Generate business notification email
const generateBusinessEmail = (data: EmailRequestBody) => {
  const rubblUrl = buildRubblMachineUrl(data);

  if (data.type === "booking") {
    const attachmentsSection =
      data.attachments && data.attachments.length > 0
        ? `
      <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Selected Attachments</h3>
        ${data.attachments
          .map((att) => {
            const pricing = att.pricing;
            let priceText = "";
            if (
              pricing &&
              (pricing.dailyRate !== undefined ||
                pricing.weeklyRate !== undefined ||
                pricing.monthlyRate !== undefined)
            ) {
              const prices = [];
              if (pricing.dailyRate !== undefined)
                prices.push(`$${pricing.dailyRate}/day`);
              if (pricing.weeklyRate !== undefined)
                prices.push(`$${pricing.weeklyRate}/week`);
              if (pricing.monthlyRate !== undefined)
                prices.push(`$${pricing.monthlyRate}/month`);
              priceText = ` - ${prices.join(", ")}`;
            }

            return `<div style="margin: 5px 0; padding: 8px; background: white; border-radius: 4px;">
            <strong>${att.name}</strong>
            ${
              att.make && att.model ? ` (${att.make} ${att.model})` : ""
            }${priceText}
          </div>`;
          })
          .join("")}
      </div>
    `
        : "";

    // Generate subject line based on cart items or single machine
    const equipmentDescription = data.cartItems && data.cartItems.length > 0
      ? data.cartItems.length === 1 
        ? data.cartItems[0].machineName
        : `${data.cartItems.length} Machines`
      : data.machineName || 'Equipment';

    return {
      subject: `Equipment Rental Request - ${equipmentDescription} - ${data.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">New Equipment Rental Booking</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">A customer has submitted a new rental request</p>
          </div>
          
          <div style="padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none;">
            <div style="display: grid; gap: 20px;">
              <!-- Customer Information -->
              <div style="padding: 15px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <h3 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Customer Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${
                  data.customerName
                }</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${
                  data.customerEmail
                }" style="color: #0ea5e9;">${data.customerEmail}</a></p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${
                  data.customerPhone
                }" style="color: #0ea5e9;">${data.customerPhone}</a></p>
                ${
                  data.businessName
                    ? `<p style="margin: 5px 0;"><strong>Business:</strong> ${data.businessName}</p>`
                    : ""
                }
                ${
                  data.address
                    ? `<p style="margin: 5px 0;"><strong>Address:</strong> ${data.address}, ${data.city}, ${data.state} ${data.zipCode}</p>`
                    : ""
                }
              </div>

              <!-- Equipment Information -->
              <div style="padding: 15px; background-color: #fef7ff; border-radius: 8px; border-left: 4px solid #a855f7;">
                <h3 style="margin: 0 0 10px 0; color: #7c2d12; font-size: 16px;">Equipment Information</h3>
                ${
                  data.cartItems && data.cartItems.length > 0
                    ? data.cartItems.map((item, index) => `
                        <div style="margin: ${index > 0 ? '15px' : '0'} 0; padding: ${index > 0 ? '15px' : '0'} 0; ${index > 0 ? 'border-top: 1px solid #e5e7eb;' : ''}">
                          <p style="margin: 5px 0;"><strong>Equipment ${data.cartItems.length > 1 ? `#${index + 1}` : ''}:</strong> ${
                            item.machineName
                          } (${item.year || data.machineYear || 'Year N/A'})</p>
                          <p style="margin: 5px 0;"><strong>Type:</strong> ${
                            item.primaryType || data.machineType || 'N/A'
                          }</p>
                          <p style="margin: 5px 0;"><strong>Quantity:</strong> ${
                            item.quantity || 1
                          }</p>
                          <p style="margin: 5px 0; font-family: 'Courier New', monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;"><strong>Machine ID:</strong> ${
                            item.machineId
                          }</p>
                        </div>
                      `).join('')
                    : `
                        <p style="margin: 5px 0;"><strong>Equipment:</strong> ${
                          data.machineName
                        } (${data.machineYear})</p>
                        <p style="margin: 5px 0;"><strong>Type:</strong> ${
                          data.machineType
                        }</p>
                        <p style="margin: 5px 0; font-family: 'Courier New', monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;"><strong>Machine ID:</strong> ${
                          data.machineId
                        }</p>
                    `
                }
                ${
                  rubblUrl && (!data.cartItems || data.cartItems.length === 0)
                    ? `<p style="margin: 10px 0;"><a href="${rubblUrl}" style="color: #a855f7; text-decoration: none;">🔗 View on Rubbl ↗</a></p>`
                    : ""
                }
              </div>

              <!-- Rental Details -->
              <div style="padding: 15px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #16a34a;">
                <h3 style="margin: 0 0 10px 0; color: #15803d; font-size: 16px;">Rental Details</h3>
                <p style="margin: 5px 0;"><strong>Start Date:</strong> ${
                  data.startDate
                }</p>
                <p style="margin: 5px 0;"><strong>Duration:</strong> ${formatDuration(
                  data.duration || 0
                )}</p>
                <p style="margin: 5px 0;"><strong>Delivery Zip:</strong> ${
                  data.zipCode
                }</p>
                <p style="margin: 5px 0;"><strong>Rent-to-Own Interest:</strong> ${
                  data.rpoInterested ? "YES" : "NO"
                }</p>
                ${
                  data.freePickup !== undefined
                    ? `<p style="margin: 5px 0;"><strong>Delivery:</strong> ${
                        data.freePickup ? "Self Pickup (Free)" : "Delivery (TBD)"
                      }</p>`
                    : ""
                }
                ${
                  data.subtotal || data.totalCost
                    ? `<p style="margin: 5px 0;"><strong>Estimated Total:</strong> ${formatCostDisplay(
                        data.subtotal || data.totalCost,
                        data.duration || 0
                      )}</p>`
                    : ""
                }
                ${
                  data.duration && data.duration >= 180
                    ? `<p style="margin: 5px 0; color: #1e40af; font-size: 14px;"><em>* Duration capped at 6 months for pricing estimate</em></p>`
                    : ""
                }
              </div>

              ${attachmentsSection}
            </div>
          </div>
          
          <div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Booking submitted at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };
  }

  if (data.type === "buy-now") {
    return {
      subject: `Equipment Purchase Inquiry - ${data.machineName} - ${data.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">New Buy It Now Request</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">A customer wants to purchase equipment</p>
          </div>
          
          <div style="padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none;">
            <div style="display: grid; gap: 20px;">
              <!-- Customer Information -->
              <div style="padding: 15px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 16px;">Customer Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${
                  data.customerName
                }</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${
                  data.customerEmail
                }" style="color: #dc2626;">${data.customerEmail}</a></p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${
                  data.customerPhone
                }" style="color: #dc2626;">${data.customerPhone}</a></p>
                ${
                  data.businessName
                    ? `<p style="margin: 5px 0;"><strong>Business:</strong> ${data.businessName}</p>`
                    : ""
                }
              </div>

              <!-- Equipment Information -->
              <div style="padding: 15px; background-color: #fef7ff; border-radius: 8px; border-left: 4px solid #a855f7;">
                <h3 style="margin: 0 0 10px 0; color: #7c2d12; font-size: 16px;">Equipment Information</h3>
                <p style="margin: 5px 0;"><strong>Equipment:</strong> ${
                  data.machineName
                } (${data.machineYear})</p>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${
                  data.machineType
                }</p>
                ${
                  data.buyItNowPrice
                    ? `<p style="margin: 5px 0;"><strong>Buy It Now Price:</strong> <span style="font-size: 18px; color: #059669; font-weight: bold;">$${data.buyItNowPrice.toLocaleString()}</span></p>`
                    : ""
                }
                <p style="margin: 5px 0; font-family: 'Courier New', monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;"><strong>Machine ID:</strong> ${
                  data.machineId
                }</p>
                ${
                  rubblUrl
                    ? `<p style="margin: 10px 0;"><a href="${rubblUrl}" style="color: #a855f7; text-decoration: none;">🔗 View on Rubbl ↗</a></p>`
                    : ""
                }
              </div>

              ${
                data.comment
                  ? `
              <div style="padding: 15px; background-color: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">Customer Message</h3>
                <p style="margin: 0; white-space: pre-wrap;">${data.comment}</p>
              </div>
              `
                  : ""
              }
            </div>
          </div>
          
          <div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Request submitted at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };
  }

  if (data.type === "no-results") {
    return {
      subject: `Equipment Search Request - ${
        data.equipment || "Custom Equipment"
      } - ${data.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Equipment Request</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Customer looking for specific equipment</p>
          </div>
          
          <div style="padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none;">
            <div style="display: grid; gap: 20px;">
              <!-- Customer Information -->
              <div style="padding: 15px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
                <h3 style="margin: 0 0 10px 0; color: #059669; font-size: 16px;">Contact Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${
                  data.customerName
                }</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${
                  data.customerEmail
                }" style="color: #059669;">${data.customerEmail}</a></p>
                ${
                  data.customerPhone
                    ? `<p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${data.customerPhone}" style="color: #059669;">${data.customerPhone}</a></p>`
                    : ""
                }
                ${
                  data.businessName
                    ? `<p style="margin: 5px 0;"><strong>Business:</strong> ${data.businessName}</p>`
                    : ""
                }
              </div>

              <!-- Equipment Request -->
              <div style="padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">Equipment Requested</h3>
                <p style="margin: 0; font-size: 16px; font-weight: bold;">${
                  data.equipment || "Not specified"
                }</p>
              </div>

              ${
                data.message
                  ? `
              <div style="padding: 15px; background-color: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">Project Details</h3>
                <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
              </div>
              `
                  : ""
              }
            </div>
          </div>
          
          <div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Equipment request submitted at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };
  }

  if (data.type === "machine-contact") {
    return {
      subject: `Machine Inquiry - ${data.machineName || "Equipment"} - ${
        data.customerName
      }`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">New Machine Contact Message</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Customer has a question about a specific machine</p>
          </div>
          <div style="padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none;">
            <div style="display: grid; gap: 20px;">
              <div style="padding: 15px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
                <h3 style="margin: 0 0 10px 0; color: #059669; font-size: 16px;">Contact Information</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${
                  data.customerName
                }</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${
                  data.customerEmail
                }" style="color: #059669;">${data.customerEmail}</a></p>
                ${
                  data.customerPhone
                    ? `<p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${data.customerPhone}" style="color: #059669;">${data.customerPhone}</a></p>`
                    : ""
                }
                ${
                  data.businessName
                    ? `<p style=\"margin: 5px 0;\"><strong>Business:</strong> ${data.businessName}</p>`
                    : ""
                }
              </div>
              <div style="padding: 15px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Machine Information</h3>
                ${
                  data.machineName
                    ? `<p style=\"margin: 5px 0;\"><strong>Equipment:</strong> ${
                        data.machineName
                      }${data.machineYear ? ` (${data.machineYear})` : ""}</p>`
                    : ""
                }
                ${
                  data.machineType
                    ? `<p style=\"margin: 5px 0;\"><strong>Type:</strong> ${data.machineType}</p>`
                    : ""
                }
                <p style="margin: 5px 0; font-family: 'Courier New', monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;"><strong>Machine ID:</strong> ${
                  data.machineId || "N/A"
                }</p>
                ${
                  rubblUrl
                    ? `<p style=\"margin: 10px 0;\"><a href="${rubblUrl}" style="color: #3b82f6; text-decoration: none;">🔗 View on Rubbl ↗</a></p>`
                    : ""
                }
              </div>
              ${
                data.message
                  ? `
                <div style=\"padding: 15px; background-color: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;\">
                  <h3 style=\"margin: 0 0 10px 0; color: #92400e; font-size: 16px;\">Customer Message</h3>
                  <p style=\"margin: 0; white-space: pre-wrap;\">${data.message}</p>
                </div>
              `
                  : ""
              }
            </div>
          </div>
          <div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Message submitted at ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    };
  }

  // Contact form
  return {
    subject: `Contact Form Submission - ${
      data.subject || "General Inquiry"
    } - ${data.customerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 24px;">New Contact Form Submission</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">${
            data.subject || "General inquiry from website"
          }</p>
        </div>
        
        <div style="padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none;">
          <div style="display: grid; gap: 20px;">
            <!-- Customer Information -->
            <div style="padding: 15px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
              <h3 style="margin: 0 0 10px 0; color: #059669; font-size: 16px;">Contact Information</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${
                data.customerName
              }</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${
                data.customerEmail
              }" style="color: #059669;">${data.customerEmail}</a></p>
              ${
                data.customerPhone
                  ? `<p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${data.customerPhone}" style="color: #059669;">${data.customerPhone}</a></p>`
                  : ""
              }
              ${
                data.businessName
                  ? `<p style="margin: 5px 0;"><strong>Business:</strong> ${data.businessName}</p>`
                  : ""
              }
            </div>

            ${
              data.message
                ? `
            <div style="padding: 15px; background-color: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">Message</h3>
              <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
            </div>
            `
                : ""
            }
          </div>
        </div>
        
        <div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Message submitted at ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `,
  };
};

// Generate customer confirmation email
const generateCustomerConfirmationEmail = (data: EmailRequestBody) => {
  if (data.type === "booking") {
    const attachmentsSection =
      data.attachments && data.attachments.length > 0
        ? `
      <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Selected Attachments</h3>
        ${data.attachments
          .map((att) => {
            const pricing = att.pricing;
            let priceText = "";
            if (
              pricing &&
              (pricing.dailyRate !== undefined ||
                pricing.weeklyRate !== undefined ||
                pricing.monthlyRate !== undefined)
            ) {
              const prices = [];
              if (pricing.dailyRate !== undefined)
                prices.push(`$${pricing.dailyRate}/day`);
              if (pricing.weeklyRate !== undefined)
                prices.push(`$${pricing.weeklyRate}/week`);
              if (pricing.monthlyRate !== undefined)
                prices.push(`$${pricing.monthlyRate}/month`);
              priceText = ` - ${prices.join(", ")}`;
            }

            return `<div style="margin: 5px 0; padding: 8px; background: white; border-radius: 4px;">
            • ${att.name}${
              att.make && att.model ? ` (${att.make} ${att.model})` : ""
            }${priceText}
          </div>`;
          })
          .join("")}
      </div>
    `
        : "";

    // Generate subject line based on cart items or single machine
    const equipmentDescription = data.cartItems && data.cartItems.length > 0
      ? data.cartItems.length === 1 
        ? data.cartItems[0].machineName
        : `${data.cartItems.length} Machines`
      : data.machineName || 'Equipment';

    return {
      subject: `Booking Confirmation - ${equipmentDescription} - Lafayette Equipment Rentals`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Booking Confirmation</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Your equipment rental request has been received</p>
          </div>
          
          <div style="padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${
              data.customerName
            },</p>
            <p style="margin: 0 0 20px 0;">Thank you for your equipment rental request! We've received your booking ${
              data.cartItems && data.cartItems.length > 0 
                ? `for ${data.cartItems.length} machine${data.cartItems.length > 1 ? 's' : ''}`
                : `for the <strong>${data.machineName}</strong>`
            } and will contact you shortly to confirm availability and arrange delivery.</p>
            
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af;">Booking Details</h3>
              ${
                data.cartItems && data.cartItems.length > 0
                  ? `
                      <div style="margin: 10px 0;">
                        <strong>Equipment (${data.cartItems.length} item${data.cartItems.length > 1 ? 's' : ''}):</strong>
                        ${data.cartItems.map((item, index) => `
                          <div style="margin: 8px 0; padding: 8px; background: white; border-radius: 4px;">
                            <strong>${index + 1}.</strong> ${item.machineName} (${item.year || 'Year N/A'})
                            <br><span style="font-size: 14px; color: #6b7280;">
                              Type: ${item.primaryType || 'N/A'} | Qty: ${item.quantity || 1} | ID: ${item.machineId}
                            </span>
                          </div>
                        `).join('')}
                      </div>
                    `
                  : `<p style="margin: 5px 0;"><strong>Equipment:</strong> ${
                      data.machineName
                    } (${data.machineYear})</p>`
              }
              <p style="margin: 5px 0;"><strong>Start Date:</strong> ${
                data.startDate
              }</p>
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${formatDuration(
                data.duration || 0
              )}</p>
              <p style="margin: 5px 0;"><strong>Delivery Location:</strong> ${
                data.zipCode
              }</p>
              ${
                data.freePickup !== undefined
                  ? `<p style="margin: 5px 0;"><strong>Delivery Method:</strong> ${
                      data.freePickup ? "Self Pickup (Free)" : "Delivery (TBD)"
                    }</p>`
                  : ""
              }
              <p style="margin: 5px 0;"><strong>Rent-to-Own Interest:</strong> ${
                data.rpoInterested ? "Yes" : "No"
              }</p>
              ${
                data.subtotal || data.totalCost
                  ? `<p style="margin: 5px 0;"><strong>Estimated Total:</strong> ${formatCostDisplay(
                      data.subtotal || data.totalCost,
                      data.duration || 0
                    )}</p>`
                  : ""
              }
            </div>

            ${attachmentsSection}
            
            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #059669;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Our team will contact you within 24 hours to confirm availability</li>
                <li>We'll schedule delivery to your specified location</li>
                <li>Payment and final details will be arranged before delivery</li>
              </ul>
            </div>
            
            <p style="margin: 20px 0 0 0;">If you have any questions or need to modify your booking, please contact us at <a href="mailto:${
              process.env.BUSINESS_EMAIL
            }" style="color: #1e40af;">${process.env.BUSINESS_EMAIL}</a></p>
          </div>
          
          <div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Lafayette Equipment Rentals | ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };
  }

  if (data.type === "buy-now") {
    return {
      subject: `Purchase Request Received - ${data.machineName} - Lafayette Equipment Rentals`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Purchase Request Received</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">We'll contact you soon about your purchase</p>
          </div>
          
          <div style="padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${
              data.customerName
            },</p>
            <p style="margin: 0 0 20px 0;">Thank you for your interest in purchasing the <strong>${
              data.machineName
            }</strong>! We've received your request and will contact you shortly with pricing and availability information.</p>
            
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #dc2626;">Equipment Details</h3>
              <p style="margin: 5px 0;"><strong>Equipment:</strong> ${
                data.machineName
              } (${data.machineYear})</p>
              <p style="margin: 5px 0;"><strong>Type:</strong> ${
                data.machineType
              }</p>
              ${
                data.buyItNowPrice
                  ? `<p style="margin: 5px 0;"><strong>Buy It Now Price:</strong> <span style="font-size: 18px; color: #059669; font-weight: bold;">$${data.buyItNowPrice.toLocaleString()}</span></p>`
                  : ""
              }
            </div>
            
            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #059669;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Our sales team will contact you within 24 hours</li>
                <li>We'll provide current pricing and availability</li>
                <li>Inspection and financing options will be discussed</li>
              </ul>
            </div>
            
            <p style="margin: 20px 0 0 0;">If you have any questions, please contact us at <a href="mailto:${
              process.env.BUSINESS_EMAIL
            }" style="color: #dc2626;">${process.env.BUSINESS_EMAIL}</a></p>
          </div>
          
          <div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Lafayette Equipment Rentals | ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };
  }

  if (data.type === "no-results") {
    return {
      subject: `Equipment Request Received - Lafayette Equipment Rentals`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Equipment Request Received</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">We're searching our network for your equipment</p>
          </div>
          
          <div style="padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${
              data.customerName
            },</p>
            <p style="margin: 0 0 20px 0;">Thank you for your equipment request! We've received your inquiry for <strong>${
              data.equipment || "custom equipment"
            }</strong> and are now searching our network of over 30,000 machines to find exactly what you need.</p>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #92400e;">Your Request</h3>
              <p style="margin: 5px 0;"><strong>Equipment Type:</strong> ${
                data.equipment || "Custom equipment"
              }</p>
              ${
                data.message
                  ? `<p style="margin: 5px 0;"><strong>Project Details:</strong> ${data.message}</p>`
                  : ""
              }
            </div>
            
            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #059669;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Our team will search our extensive network of equipment providers</li>
                <li>We'll contact you within 24 hours with available options</li>
                <li>We'll provide pricing, availability, and delivery information</li>
              </ul>
            </div>
            
            <p style="margin: 20px 0 0 0;">For immediate assistance, contact us at <a href="mailto:${
              process.env.BUSINESS_EMAIL
            }" style="color: #f59e0b;">${process.env.BUSINESS_EMAIL}</a></p>
          </div>
          
          <div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Lafayette Equipment Rentals | ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };
  }

  if (data.type === "machine-contact") {
    return {
      subject: `We received your message - ${
        data.machineName || "Machine Inquiry"
      }`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Message Received</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Thanks for contacting us about a specific machine.</p>
          </div>
          <div style="padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0 0 12px 0;">Hi ${data.customerName},</p>
            <p style="margin: 0 0 12px 0;">We've received your message regarding:</p>
            <ul style="margin: 0 0 12px 20px;">
              ${
                data.machineName
                  ? `<li><strong>Equipment:</strong> ${data.machineName}${
                      data.machineYear ? ` (${data.machineYear})` : ""
                    }</li>`
                  : ""
              }
              ${
                data.machineType
                  ? `<li><strong>Type:</strong> ${data.machineType}</li>`
                  : ""
              }
              ${
                data.machineId
                  ? `<li><strong>Machine ID:</strong> <code>${data.machineId}</code></li>`
                  : ""
              }
            </ul>
            <p style="margin: 0;">Our team will reach out shortly. For urgent questions, call us at ${
              process.env.BUSINESS_PHONE || "(337) 545-2935"
            }.</p>
          </div>
          <div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Lafayette Equipment Rentals | ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    };
  }

  // Contact form confirmation
  return {
    subject: `Message Received - Lafayette Equipment Rentals`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 24px;">Message Received</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Thank you for contacting us</p>
        </div>
        
        <div style="padding: 20px; background: white; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${
            data.customerName
          },</p>
          <p style="margin: 0 0 20px 0;">Thank you for reaching out to Lafayette Equipment Rentals! We've received your message and will get back to you as soon as possible.</p>
          
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #059669;">What's Next?</h3>
            <p style="margin: 0;">Our team typically responds to inquiries within 24 hours during business hours. For urgent matters, please call us directly.</p>
          </div>
          
          <p style="margin: 20px 0 0 0;">For immediate assistance, contact us at <a href="mailto:${
            process.env.BUSINESS_EMAIL
          }" style="color: #059669;">${process.env.BUSINESS_EMAIL}</a></p>
        </div>
        
        <div style="padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Lafayette Equipment Rentals | ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `,
  };
};

export async function POST(request: NextRequest) {
  try {
    const data: EmailRequestBody = await request.json();

    // Validate required fields
    if (!data.customerEmail || !data.customerName || !data.type) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: customerEmail, customerName, and type are required",
        },
        { status: 400 }
      );
    }

    // Verify hCaptcha token if provided and secret key is configured
    if (data.captchaToken && process.env.HCAPTCHA_SECRET_KEY) {
      try {
        const verifyResult = await verify(
          process.env.HCAPTCHA_SECRET_KEY,
          data.captchaToken
        );

        if (!verifyResult.success) {
          console.log("hCaptcha verification failed:", verifyResult);
          return NextResponse.json(
            { error: "Captcha verification failed. Please try again." },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("hCaptcha verification error:", error);
        // Continue without captcha verification in case of error
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check required environment variables
    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      !process.env.BUSINESS_EMAIL
    ) {
      console.error("Missing email configuration environment variables");
      console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Set" : "Not set");
      console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Set" : "Not set");
      console.log(
        "BUSINESS_EMAIL:",
        process.env.BUSINESS_EMAIL ? "Set" : "Not set"
      );

      // In development, log the request and continue without sending emails
      if (process.env.NODE_ENV === "development") {
        console.log("=== EMAIL SIMULATION (Email not configured) ===");
        console.log("Type:", data.type);
        console.log(
          "Customer:",
          data.customerName,
          "(",
          data.customerEmail,
          ")"
        );
        if (data.type === "no-results") {
          console.log("Equipment:", data.equipment);
        }
        if (data.type === "booking") {
          console.log("Equipment:", data.machineName);
          console.log("Duration:", data.duration, "days");
          console.log("Start Date:", data.startDate);
          console.log("Total Cost:", data.totalCost);
          console.log("Cart Items:", data.cartItems?.length || 0, "items");
        }
        console.log("=== END EMAIL SIMULATION ===");

        return NextResponse.json({
          success: true,
          message: `${data.type} request processed successfully (email simulation mode)`,
          confirmationSent: false,
          devMode: true,
          emailConfigured: false,
        });
      }

      // In production, return error but don't break the user experience
      console.error("Email service not configured in production");
      return NextResponse.json({
        success: true,
        message: `${data.type} request processed successfully (email service not configured)`,
        confirmationSent: false,
        emailError: "Email service not configured",
      });
    }

    console.log(
      `Sending ${data.type} email for ${data.customerName} (${data.customerEmail})`
    );
    console.log("SMTP Configuration:", {
      host: process.env.EMAIL_HOST || "mail.improvmx.com",
      port: process.env.EMAIL_PORT || "587",
      user: process.env.EMAIL_USER
        ? process.env.EMAIL_USER.substring(0, 5) + "***"
        : "not set",
      secure: process.env.EMAIL_SECURE === "true",
    });

    const transporter = createTransporter();

    // Generate emails
    const businessEmail = generateBusinessEmail(data);
    const customerEmail = generateCustomerConfirmationEmail(data);

    try {
      // Send business notification email to multiple recipients
      const businessRecipients = [
        process.env.BUSINESS_EMAIL,
        "greezygotime@gmail.com",
        "info@Lafayetteequipmentrentals.com",
        // 'adam@rubbl.com',
        // 'jenna@rubbl.com'
      ]
        .filter(Boolean)
        .join(", ");

      console.log("Sending emails in parallel...");
      // Send both emails in parallel for better performance
      const [businessResult, customerResult] = await Promise.all([
        transporter.sendMail({
          from: `"Lafayette Equipment Rentals" <${process.env.EMAIL_USER}>`,
          to: businessRecipients,
          replyTo: data.customerEmail, // Set reply-to to customer for easy response
          subject: businessEmail.subject,
          html: businessEmail.html,
          // Enhanced headers for better deliverability
          headers: {
            "Message-ID": `<${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@Lafayetterentals.com>`,
            "X-Mailer": "Lafayette Equipment Rentals Notification System",
            "X-Priority": "3",
            "X-MSMail-Priority": "Normal",
            Importance: "Normal",
            "List-Unsubscribe": `<mailto:${process.env.BUSINESS_EMAIL}?subject=Unsubscribe>`,
            Organization: "Lafayette Equipment Rentals",
            "X-Auto-Response-Suppress": "DR, RN, NRN, OOF, AutoReply",
          },
          // Add text version for better deliverability
          text: `New ${data.type} from ${data.customerName} (${data.customerEmail})\n\nPlease check your email for full details.`,
        }),
        transporter.sendMail({
          from: `"Lafayette Equipment Rentals" <${process.env.EMAIL_USER}>`,
          to: data.customerEmail,
          replyTo: process.env.BUSINESS_EMAIL, // Reply goes to business email
          subject: customerEmail.subject,
          html: customerEmail.html,
          // Enhanced headers for better deliverability
          headers: {
            "Message-ID": `<${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}@Lafayetterentals.com>`,
            "X-Mailer": "Lafayette Equipment Rentals Confirmation System",
            "X-Priority": "3",
            "X-MSMail-Priority": "Normal",
            Importance: "Normal",
            "List-Unsubscribe": `<mailto:${process.env.BUSINESS_EMAIL}?subject=Unsubscribe>`,
            Organization: "Lafayette Equipment Rentals",
            "X-Auto-Response-Suppress": "DR, RN, NRN, OOF, AutoReply",
          },
          // Add text version for better deliverability
          text: `Thank you for contacting Lafayette Equipment Rentals, ${data.customerName}!\n\nWe've received your ${data.type} request and will be in touch soon.\n\nPlease check your email for full details.`,
        }),
      ]);

      console.log("Both emails sent successfully in parallel");
    } catch (emailError) {
      console.error("SMTP Error Details:", {
        error:
          emailError instanceof Error ? emailError.message : "Unknown error",
        code: (emailError as any)?.code,
        command: (emailError as any)?.command,
        response: (emailError as any)?.response,
        responseCode: (emailError as any)?.responseCode,
        timestamp: new Date().toISOString(),
      });

      // In development mode, log the error but don't fail the request
      if (
        process.env.NODE_ENV === "development" &&
        process.env.SKIP_EMAIL_IN_DEV !== "false"
      ) {
        console.log("=== EMAIL SIMULATION (SMTP Error in Development) ===");
        console.log("Type:", data.type);
        console.log(
          "Customer:",
          data.customerName,
          "(",
          data.customerEmail,
          ")"
        );
        console.log(
          "SMTP Error:",
          emailError instanceof Error
            ? emailError.message
            : "Unknown SMTP error"
        );
        console.log("=== END EMAIL SIMULATION ===");

        return NextResponse.json({
          success: true,
          message: `${data.type} request processed successfully (email simulation mode - SMTP error bypassed)`,
          confirmationSent: false,
          devMode: true,
          smtpError:
            emailError instanceof Error
              ? emailError.message
              : "Unknown SMTP error",
        });
      }

      // Return error with more details for debugging in production
      return NextResponse.json(
        {
          error: "Failed to send email via SMTP",
          details:
            emailError instanceof Error
              ? emailError.message
              : "Unknown SMTP error",
          smtpConfig: {
            host: process.env.EMAIL_HOST || "mail.improvmx.com",
            port: process.env.EMAIL_PORT || "587",
            user: process.env.EMAIL_USER
              ? process.env.EMAIL_USER.substring(0, 3) + "***"
              : "not set",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Emails sent successfully",
      confirmationSent: true,
    });
  } catch (error) {
    console.error("General error in email API:", error);
    return NextResponse.json(
      {
        error: "Failed to process email request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
