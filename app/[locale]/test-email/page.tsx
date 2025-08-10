"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function TestEmailPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const testEmail = async (type: string) => {
    setIsSubmitting(true);
    setError("");
    setResult(null);

    try {
      const testData = {
        type,
        customerName: "Test User",
        customerEmail: "test@example.com",
        customerPhone: "(337) 545-2935",
        businessName: "Test Business",
        message: "This is a test email from the test page",
        equipment: "Test Equipment",
        machineName: "Test Machine",
        machineYear: "2023",
        machineMake: "Test",
        machineModel: "Model",
        machineType: "Test Type",
        startDate: new Date().toLocaleDateString(),
        duration: 7,
        zipCode: "30655",
        totalCost: 1000,
        address: "200 Barrett St, Lafayette, LA 30655",
      };

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      const responseData = await response.json();
      console.log("Test Email Response:", responseData);
      setResult(responseData);

      if (!response.ok) {
        setError(`Email test failed: ${responseData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Test email error:", err);
      setError(
        `Test failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Email Service Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Email Configuration Status
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <strong>EMAIL_HOST:</strong>{" "}
                {process.env.NEXT_PUBLIC_EMAIL_HOST || "Not set"}
              </div>
              <div>
                <strong>EMAIL_USER:</strong>{" "}
                {process.env.NEXT_PUBLIC_EMAIL_USER ? "Set" : "Not set"}
              </div>
              <div>
                <strong>BUSINESS_EMAIL:</strong>{" "}
                {process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "Not set"}
              </div>
              <div>
                <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Test Different Email Types
            </h2>
            <div className="space-y-3">
              <Button
                onClick={() => testEmail("contact")}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Testing..." : "Test Contact Form"}
              </Button>

              <Button
                onClick={() => testEmail("no-results")}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Testing..." : "Test Equipment Search"}
              </Button>

              <Button
                onClick={() => testEmail("booking")}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Testing..." : "Test Equipment Booking"}
              </Button>

              <Button
                onClick={() => testEmail("buy-now")}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Testing..." : "Test Buy It Now"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}

            {result && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <strong>Success!</strong>
                <pre className="mt-2 text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            {!result && !error && (
              <div className="text-gray-500 text-center py-8">
                Click a test button to see results here
              </div>
            )}
          </div>

          <div className="bg-orange-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
            <div className="text-sm space-y-2">
              <p>
                <strong>1.</strong> Create a <code>.env.local</code> file in the
                root directory
              </p>
              <p>
                <strong>2.</strong> Add your email configuration:
              </p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {`EMAIL_HOST=mail.improvmx.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@Lafayetteequipmentrentals.com
EMAIL_PASS=your-email-password
BUSINESS_EMAIL=info@Lafayetteequipmentrentals.com`}
              </pre>
              <p>
                <strong>3.</strong> Restart your development server
              </p>
              <p>
                <strong>4.</strong> Test the email service using the buttons
                above
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
