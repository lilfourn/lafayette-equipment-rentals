import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET(request: NextRequest) {
  // Check if test is authorized (you can add a secret key check here)
  const authHeader = request.headers.get("authorization");
  const testKey = process.env.MASTER_KEY_B64 || "test-key";
  
  if (authHeader !== `Bearer ${testKey}`) {
    return NextResponse.json(
      { error: "Unauthorized - provide Bearer token in Authorization header" },
      { status: 401 }
    );
  }

  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    configuration: {
      host: process.env.EMAIL_HOST || "Not set",
      port: process.env.EMAIL_PORT || "Not set",
      secure: process.env.EMAIL_SECURE === "true",
      user: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + "***" : "Not set",
      businessEmail: process.env.BUSINESS_EMAIL || "Not set",
    },
    tests: {
      envVarsPresent: false,
      connectionTest: false,
      authTest: false,
      sendTest: false,
    },
    errors: [] as string[],
  };

  // Test 1: Check if environment variables are set
  if (
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.BUSINESS_EMAIL
  ) {
    results.tests.envVarsPresent = true;
  } else {
    results.errors.push("Missing required environment variables");
    return NextResponse.json(results, { status: 500 });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "mail.improvmx.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: "SSLv3",
    },
    connectionTimeout: 15000, // 15 seconds for testing
    greetingTimeout: 15000,
    socketTimeout: 15000,
    debug: true, // Enable debug for testing
    logger: true, // Enable logging for testing
  });

  // Test 2: Verify connection
  try {
    console.log("Testing SMTP connection...");
    await transporter.verify();
    results.tests.connectionTest = true;
    results.tests.authTest = true;
    console.log("SMTP connection verified successfully");
  } catch (error: any) {
    console.error("SMTP connection test failed:", error);
    results.errors.push(`Connection/Auth failed: ${error.message}`);
    results.tests.connectionTest = false;
    results.tests.authTest = false;
    
    // Return early if connection fails
    return NextResponse.json(results, { status: 500 });
  }

  // Test 3: Try to send a test email
  try {
    console.log("Sending test email...");
    const testResult = await transporter.sendMail({
      from: `"Email Test" <${process.env.EMAIL_USER}>`,
      to: process.env.BUSINESS_EMAIL,
      subject: `Email Test - ${new Date().toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Configuration Test</h2>
          <p>This is a test email to verify your email configuration is working correctly.</p>
          <hr />
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
          <p><strong>SMTP Host:</strong> ${process.env.EMAIL_HOST}</p>
          <p><strong>SMTP Port:</strong> ${process.env.EMAIL_PORT}</p>
          <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
          <p><strong>To:</strong> ${process.env.BUSINESS_EMAIL}</p>
          <hr />
          <p style="color: green;"><strong>✅ Email system is working!</strong></p>
        </div>
      `,
      text: `Email Configuration Test\n\nThis is a test email sent at ${new Date().toLocaleString()}\n\n✅ Email system is working!`,
    });

    console.log("Test email sent successfully:", testResult);
    results.tests.sendTest = true;
    
    // Add send result details
    (results as any).sendResult = {
      messageId: testResult.messageId,
      accepted: testResult.accepted,
      rejected: testResult.rejected,
      response: testResult.response,
    };
  } catch (error: any) {
    console.error("Failed to send test email:", error);
    results.errors.push(`Send test failed: ${error.message}`);
    results.tests.sendTest = false;
    
    // Add error details
    (results as any).sendError = {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    };
  }

  // Determine overall status
  const allTestsPassed = Object.values(results.tests).every(test => test === true);
  
  return NextResponse.json(
    {
      ...results,
      status: allTestsPassed ? "✅ All tests passed!" : "❌ Some tests failed",
      recommendation: allTestsPassed 
        ? "Your email configuration is working correctly. Contact forms should be sending emails."
        : "Please check the errors above and fix your email configuration.",
    },
    { status: allTestsPassed ? 200 : 500 }
  );
}