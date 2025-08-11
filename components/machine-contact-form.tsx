"use client";

import { HCaptchaComponent } from "@/components/hcaptcha-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  handlePhoneInputChange,
  validateEmail,
  validatePhone,
} from "@/lib/validation";
import { CheckCircle, Mail, MessageSquare, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface MachineContactFormProps {
  machineId: string;
  machineName?: string;
  machineYear?: string | number;
  machineMake?: string;
  machineModel?: string;
  machineType?: string;
  imageUrl?: string;
}

export default function MachineContactForm(props: MachineContactFormProps) {
  const {
    machineId,
    machineName,
    machineYear,
    machineMake,
    machineModel,
    machineType,
    imageUrl,
  } = props;

  const t = useTranslations();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [rubblUrl, setRubblUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRubblUrl(window.location.href);
    }
  }, []);

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
          type: "machine-contact",
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          businessName: formData.businessName,
          message: formData.message,
          captchaToken: captchaToken,
          // machine context
          machineId,
          machineName,
          machineYear: machineYear?.toString(),
          machineMake,
          machineModel,
          machineType,
          rubblUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(
          `Failed to send message: ${errorData.error || "Unknown error"}`
        );
      }

      await response.json();
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
      businessName: "",
      message: "",
    });
    setIsSubmitted(false);
    setErrors({});
    setCaptchaToken(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      <div className="p-6 md:p-8">
        {/* Machine Summary */}
        <div className="flex items-center gap-4 mb-6">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={machineName || "Machine"}
              width={96}
              height={72}
              className="rounded-md object-cover w-24 h-18"
            />
          ) : null}
          <div>
            <p className="text-sm text-gray-500">You're contacting us about:</p>
            <p className="font-semibold text-gray-900">
              {machineYear ? `${machineYear} ` : ""}
              {machineName ||
                `${machineMake || ""} ${machineModel || ""}`.trim()}
            </p>
            <p className="text-xs text-gray-500">
              ID: <span className="font-mono">{machineId}</span>
            </p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-turquoise-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Message Sent!
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Thanks for reaching out. We'll get back to you shortly.
            </p>
            <Button
              onClick={resetForm}
              variant="outline"
              className="border-2 border-turquoise-600 text-turquoise-600 hover:bg-turquoise-600 hover:text-white px-6 py-3 font-semibold"
            >
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="h-14 pl-12 pr-4"
                  placeholder="Full Name"
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
                  className="h-14 pl-12 pr-4"
                  placeholder="Phone (Optional)"
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
                className="h-14 pl-12 pr-4"
                placeholder="Email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <Input
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleChange}
                className="h-12"
                placeholder={t("noResults.form.businessName")}
              />
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
                className="resize-none pl-12 pr-4 py-4"
                placeholder={t("noResults.form.tellUsAboutProject")}
              />
            </div>

            <div className="flex justify-center mb-2">
              <HCaptchaComponent
                onVerify={setCaptchaToken}
                onExpire={() => setCaptchaToken(null)}
                theme="light"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-turquoise-600 hover:bg-turquoise-700 text-white font-bold text-lg"
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting
                ? t("common.buttons.sending")
                : t("common.buttons.sendMessage")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
