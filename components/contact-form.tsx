"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  handlePhoneInputChange,
  validateEmail,
  validatePhone,
} from "@/lib/validation";
import {
  CheckCircle,
  ChevronRight,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { HCaptchaComponent } from "@/components/hcaptcha-provider";

export default function ContactForm() {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      validateEmail(formData.email) &&
      formData.message.trim() &&
      (!formData.phone || validatePhone(formData.phone)) &&
      captchaToken !== null
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
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
        email: validateEmail(value) ? undefined : "Invalid email address",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaToken) {
      alert("Please complete the captcha verification");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "contact",
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          subject: "Website Contact Form",
          message: formData.message,
          captchaToken: captchaToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(
          `Failed to send message: ${errorData.error || "Unknown error"}`
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

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
    setIsSubmitted(false);
    setErrors({});
    setCaptchaToken(null);
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      <div className="p-8">
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-turquoise-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Message Sent Successfully!
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Thank you for contacting us! We'll respond to your inquiry within 24 hours.
            </p>
            <Button
              onClick={resetForm}
              variant="outline"
              className="border-2 border-turquoise-600 text-turquoise-600 hover:bg-turquoise-600 hover:text-white px-6 py-3 font-semibold transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t("contactPage.form.title")}
            </h3>
            <p className="text-gray-600">
              {t("contactPage.form.subtitle")}
            </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                className="h-14 pl-12 pr-4 border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                placeholder={t("contactPage.form.name")}
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                className="h-14 pl-12 pr-4 border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                placeholder={t("contactPage.form.phone")}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-14 pl-12 pr-4 border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                placeholder={t("contactPage.form.email")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <Textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
                className="resize-none pl-12 pr-4 py-4 border-gray-300 focus:border-turquoise-500 focus:ring-turquoise-500"
                placeholder={t("contactPage.form.message")}
              />
            </div>

            <div className="flex justify-center mb-4">
              <HCaptchaComponent
                onVerify={handleCaptchaVerify}
                onExpire={handleCaptchaExpire}
                theme="light"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-14 bg-turquoise-600 hover:bg-turquoise-700 text-white font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer"
                disabled={isSubmitting || !isFormValid()}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {t("common.buttons.sending")}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {t("contactPage.form.sendButton")}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
