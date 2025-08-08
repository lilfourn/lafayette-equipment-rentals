"use client";

import { HCaptchaComponent } from "@/components/hcaptcha-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  handlePhoneInputChange,
  validateEmail,
  validatePhone,
} from "@/lib/validation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NoResultsProps {
  equipmentType?: string;
}

export default function NoResults({ equipmentType }: NoResultsProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    equipment: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Form validation
  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      validateEmail(formData.email) &&
      formData.equipment.trim() &&
      (!formData.phone || validatePhone(formData.phone))
    );
  };

  // Auto-fill equipment field when on individual equipment page
  useEffect(() => {
    if (equipmentType) {
      setFormData((prev) => ({
        ...prev,
        equipment: equipmentType,
      }));
    }
  }, [equipmentType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submitting
    if (!isFormValid()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting no-results form:", formData);

      // Send the form data to the API
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "no-results",
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          businessName: formData.businessName,
          equipment: formData.equipment,
          message: formData.message,
          captchaToken: captchaToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(
          `Failed to send request: ${errorData.error || "Unknown error"}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (result.devMode) {
        console.log("Development mode: Email simulation completed");
        console.log("Message:", result.message);
        if (result.smtpError) {
          console.log("SMTP Error (bypassed):", result.smtpError);
        }
      }

      console.log("No-results request processed successfully");
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        "Failed to submit request. Please try again or contact us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Handle phone formatting
      handlePhoneInputChange(value, (formattedPhone) => {
        setFormData((prev) => ({ ...prev, phone: formattedPhone }));
        setErrors((prev) => ({
          ...prev,
          phone:
            formattedPhone && !validatePhone(formattedPhone)
              ? "Phone number must be 10 digits"
              : undefined,
        }));
      });
    } else if (name === "email") {
      setFormData((prev) => ({ ...prev, email: value }));
      setErrors((prev) => ({
        ...prev,
        email:
          value && !validateEmail(value)
            ? "Please enter a valid email address"
            : undefined,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 min-h-[600px]">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
            <CheckCircle className="w-24 h-24 text-green-500 relative animate-[bounce_1s_ease-in-out]" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("noResults.success.title")}
          </h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {t("noResults.success.message")}
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  businessName: "",
                  equipment: equipmentType || "",
                  message: "",
                });
                setCaptchaToken(null);
              }}
              variant="outline"
              className="border-gray-300 hover:border-orange-500"
            >
              {t("noResults.success.submitAnother")}
            </Button>
            <Link href="/equipment-rental">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Browse Equipment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-full py-12 px-4">
      {/* Hero Section with Gradient Background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-gray-50 rounded-3xl -z-10"></div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            {/* Alert Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <AlertCircle className="w-4 h-4" />
              <span>Equipment Currently Unavailable</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              We'll Find the Perfect {equipmentType || "Equipment"} for You
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Just because it's not listed doesn't mean we can't get it. Tell us
              what you need and we'll make it happen within 24 hours.
            </p>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 rounded-lg p-3">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    24-Hour Response
                  </h3>
                  <p className="text-sm text-gray-600">
                    We'll find and deliver your equipment fast
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 rounded-lg p-3">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Expert Team
                  </h3>
                  <p className="text-sm text-gray-600">
                    Dedicated specialists to source your needs
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 rounded-lg p-3">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Guaranteed Quality
                  </h3>
                  <p className="text-sm text-gray-600">
                    All equipment tested and certified
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Request Form Card */}
          <Card className="max-w-3xl mx-auto bg-white shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-8 rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-center">
                Request Equipment Quote
              </CardTitle>
              <CardDescription className="text-orange-100 text-center mt-2">
                Fill out the form below and we'll get started on finding your
                equipment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-gray-700 font-semibold flex items-center gap-1"
                    >
                      {t("noResults.form.name")}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="John Smith"
                      className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-gray-700 font-semibold flex items-center gap-1"
                    >
                      {t("noResults.form.email")}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="john@company.com"
                      className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone and Equipment Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-gray-700 font-semibold"
                    >
                      {t("noResults.form.phone")}
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                      className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="equipment"
                      className="text-gray-700 font-semibold flex items-center gap-1"
                    >
                      {t("noResults.form.equipmentType")}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="equipment"
                      name="equipment"
                      value={formData.equipment}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Zero Turn Mower, Excavator"
                      className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Business Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="businessName"
                    className="text-gray-700 font-semibold"
                  >
                    {t("noResults.form.businessName")}
                  </Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Your Company Name (Optional)"
                    className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                {/* Project Details */}
                <div className="space-y-2">
                  <Label
                    htmlFor="message"
                    className="text-gray-700 font-semibold"
                  >
                    {t("noResults.form.projectDetails")}
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your project timeline, specific requirements, or any other details that will help us find the right equipment for you..."
                    rows={4}
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                  />
                </div>

                {/* Captcha */}
                <div className="flex justify-center py-4">
                  <HCaptchaComponent
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    theme="light"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  disabled={isSubmitting || !isFormValid()}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Get My Equipment Quote
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500 mb-6">
              <div className="h-px bg-gray-300 w-12"></div>
              <span className="text-sm font-medium uppercase tracking-wider">
                Or Contact Us Directly
              </span>
              <div className="h-px bg-gray-300 w-12"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <a
                href="tel:+17707625498"
                className="group flex items-center gap-4 bg-white rounded-xl p-4 px-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-500 transition-all"
              >
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-lg text-white">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 mb-1">Call us at</p>
                  <p className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                    (770) 762-5498
                  </p>
                </div>
              </a>

              <a
                href="mailto:info@Lafayetteequipmentrentals.com"
                className="group flex items-center gap-4 bg-white rounded-xl p-4 px-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-500 transition-all"
              >
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-lg text-white">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 mb-1">Email us at</p>
                  <p className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                    info@Lafayetteequipmentrentals.com
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
