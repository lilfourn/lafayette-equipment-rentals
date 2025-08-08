"use client";

import type { Machine } from "@/components/machine-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Dialog as PopupDialog,
  DialogContent as PopupDialogContent,
} from "@/components/ui/dialog";
import DurationSelector from "@/components/ui/duration-selector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  handlePhoneInputChange,
  validateEmail,
  validatePhone,
} from "@/lib/validation";
import { addDays, format } from "date-fns";
import { CalendarIcon, Check, ChevronLeft, Info, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine;
}

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  businessName?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface ReservationData {
  machineId: string;
  machineName: string;
  startDate: Date;
  duration: number;
  zipCode: string;
  rpoInterested: boolean;
  contactInfo: ContactInfo;
  totalCost: number;
  selectedAttachments: string[];
}

export default function BookingModal({
  isOpen,
  onClose,
  machine,
}: BookingModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [startDate, setStartDate] = useState<Date>();
  const [duration, setDuration] = useState(7);
  const [zipCode, setZipCode] = useState("");
  const [rpoInterested, setRpoInterested] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: "",
    phone: "",
    email: "",
    businessName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const [showAddedPopup, setShowAddedPopup] = useState(false);

  const steps = [
    {
      name: "startDate",
      title: "Start date, duration, zipcode",
      buttonText: "Review",
    },
    {
      name: "contact",
      title: "Contact Information",
      buttonText: "Reserve",
    },
    {
      name: "confirmation",
      title: "Reservation Confirmed",
      buttonText: "Close",
    },
  ];

  // Load saved contact info from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedContactInfo = localStorage.getItem("bookingContactInfo");
      if (savedContactInfo) {
        setContactInfo(JSON.parse(savedContactInfo));
      }
    }
  }, []);

  // Save contact info to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && contactInfo.name) {
      localStorage.setItem("bookingContactInfo", JSON.stringify(contactInfo));
    }
  }, [contactInfo]);

  // Helper function to get rental rates from the machine data (same as other components)
  const getRentalRates = () => {
    let daily: number | undefined,
      weekly: number | undefined,
      monthly: number | undefined;

    if (typeof machine.rentalRate === "number") {
      // If rentalRate is a single number, assume it's monthly
      monthly = machine.rentalRate;
    } else if (machine.rentalRate && typeof machine.rentalRate === "object") {
      daily = machine.rentalRate.daily;
      weekly = machine.rentalRate.weekly;
      monthly = machine.rentalRate.monthly;
    }

    // Try to get rates from rateSchedules if available
    if (machine.rateSchedules) {
      machine.rateSchedules.forEach((schedule) => {
        if (schedule.label === "DAY" && schedule.numDays === 1) {
          daily = schedule.cost;
        } else if (schedule.label === "WEEK" && schedule.numDays === 7) {
          weekly = schedule.cost;
        } else if (schedule.label.includes("MOS") || schedule.numDays >= 28) {
          if (!monthly || schedule.numDays <= 31) {
            monthly = schedule.cost;
          }
        }
      });
    }

    return { daily, weekly, monthly };
  };

  // Helper function to get attachment rental rates
  const getAttachmentRates = (attachment: any) => {
    let daily: number | undefined,
      weekly: number | undefined,
      monthly: number | undefined;

    if (typeof attachment.rentalRate === "number") {
      monthly = attachment.rentalRate;
    } else if (
      attachment.rentalRate &&
      typeof attachment.rentalRate === "object"
    ) {
      daily = attachment.rentalRate.daily;
      weekly = attachment.rentalRate.weekly;
      monthly = attachment.rentalRate.monthly;
    }

    if (attachment.rateSchedules) {
      attachment.rateSchedules.forEach((schedule: any) => {
        if (schedule.label === "DAY" && schedule.numDays === 1) {
          daily = schedule.cost;
        } else if (schedule.label === "WEEK" && schedule.numDays === 7) {
          weekly = schedule.cost;
        } else if (schedule.label.includes("MOS") || schedule.numDays >= 28) {
          if (!monthly || schedule.numDays <= 31) {
            monthly = schedule.cost;
          }
        }
      });
    }

    // Filter out invalid rates
    daily = daily && daily > 0 ? daily : undefined;
    weekly = weekly && weekly > 0 ? weekly : undefined;
    monthly = monthly && monthly > 0 ? monthly : undefined;

    return { daily, weekly, monthly };
  };

  const calculateTotalCost = () => {
    const { daily, weekly, monthly } = getRentalRates();

    // Calculate machine cost based on duration using the appropriate rate
    let machineCost = 0;
    const actualDuration = Math.min(duration, 180); // Cap at 6 months for calculation

    if (actualDuration >= 180) {
      // 6+ months
      // Use 6-month rate for 6+ month rentals - prefer monthly rate
      if (monthly) {
        machineCost = monthly * 6;
      } else if (weekly) {
        machineCost = weekly * 26; // ~6 months in weeks
      } else if (daily) {
        machineCost = daily * 180;
      }
    } else if (actualDuration >= 30) {
      // 1+ months
      // For monthly rentals, use monthly rate
      if (monthly) {
        const months = Math.ceil(actualDuration / 30);
        machineCost = monthly * months;
      } else if (weekly) {
        const weeks = Math.ceil(actualDuration / 7);
        machineCost = weekly * weeks;
      } else if (daily) {
        machineCost = daily * actualDuration;
      }
    } else if (actualDuration >= 7) {
      // 1+ weeks
      // For weekly rentals, use weekly rate
      if (weekly) {
        const weeks = Math.ceil(actualDuration / 7);
        machineCost = weekly * weeks;
      } else if (daily) {
        machineCost = daily * actualDuration;
      } else if (monthly) {
        // Fall back to monthly rate if no weekly/daily available
        machineCost = monthly * Math.ceil(actualDuration / 30);
      }
    } else {
      // Daily rental
      if (daily) {
        machineCost = daily * actualDuration;
      } else if (weekly) {
        // If no daily rate, use weekly rate
        machineCost = weekly * Math.ceil(actualDuration / 7);
      } else if (monthly) {
        // Fall back to monthly rate
        machineCost = monthly * Math.ceil(actualDuration / 30);
      }
    }

    // Calculate attachment costs
    let attachmentCost = 0;
    if (machine.relatedAttachments && selectedAttachments.length > 0) {
      machine.relatedAttachments.forEach((attachment) => {
        const attachmentName = attachment.name || attachment.displayName || "";
        if (selectedAttachments.includes(attachmentName)) {
          const {
            daily: attDaily,
            weekly: attWeekly,
            monthly: attMonthly,
          } = getAttachmentRates(attachment);

          // Use same duration logic as machine for attachments
          if (actualDuration >= 180) {
            // 6+ months
            if (attMonthly) {
              attachmentCost += attMonthly * 6;
            } else if (attWeekly) {
              attachmentCost += attWeekly * 26;
            } else if (attDaily) {
              attachmentCost += attDaily * 180;
            }
          } else if (actualDuration >= 30) {
            // 1+ months
            if (attMonthly) {
              const months = Math.ceil(actualDuration / 30);
              attachmentCost += attMonthly * months;
            } else if (attWeekly) {
              const weeks = Math.ceil(actualDuration / 7);
              attachmentCost += attWeekly * weeks;
            } else if (attDaily) {
              attachmentCost += attDaily * actualDuration;
            }
          } else if (actualDuration >= 7) {
            // 1+ weeks
            if (attWeekly) {
              const weeks = Math.ceil(actualDuration / 7);
              attachmentCost += attWeekly * weeks;
            } else if (attDaily) {
              attachmentCost += attDaily * actualDuration;
            } else if (attMonthly) {
              attachmentCost += attMonthly * Math.ceil(actualDuration / 30);
            }
          } else {
            // Daily rental
            if (attDaily) {
              attachmentCost += attDaily * actualDuration;
            } else if (attWeekly) {
              attachmentCost += attWeekly * Math.ceil(actualDuration / 7);
            } else if (attMonthly) {
              attachmentCost += attMonthly * Math.ceil(actualDuration / 30);
            }
          }
        }
      });
    }

    return machineCost + attachmentCost;
  };

  const getCostDisplay = () => {
    const cost = calculateTotalCost();
    const isMaxDuration = duration >= 180;
    return isMaxDuration ? `$${cost.toFixed(0)}+` : `$${cost.toFixed(0)}`;
  };

  const getDurationDisplay = () => {
    if (duration >= 180) {
      return "6+ months";
    } else if (duration >= 30) {
      const months = Math.round(duration / 30);
      return `${months} month${months > 1 ? "s" : ""}`;
    } else if (duration >= 7) {
      const weeks = Math.round(duration / 7);
      return `${weeks} week${weeks > 1 ? "s" : ""}`;
    } else {
      return `${duration} day${duration > 1 ? "s" : ""}`;
    }
  };

  // Using validation functions from lib/validation.ts

  const isStep1Valid = () => {
    return startDate && duration > 0 && zipCode.length >= 5;
  };

  const isStep2Valid = () => {
    return (
      contactInfo.name &&
      contactInfo.phone &&
      contactInfo.email &&
      contactInfo.address &&
      contactInfo.city &&
      contactInfo.state &&
      contactInfo.zipCode &&
      validateEmail(contactInfo.email) &&
      validatePhone(contactInfo.phone)
    );
  };

  const handleNext = async () => {
    if (currentStep === 0 && isStep1Valid()) {
      setCurrentStep(1);
    } else if (currentStep === 1 && isStep2Valid()) {
      setIsLoading(true);
      await handleReservation();
      setCurrentStep(2);
      setIsLoading(false);
    } else if (currentStep === 2) {
      onClose();
      resetModal();
      // Redirect to search results page
      router.push("/");
    }
  };

  const handleReservation = async () => {
    const reservationData: ReservationData = {
      machineId: machine.id,
      machineName: `${machine.make} ${machine.model}`.trim(),
      startDate: startDate!,
      duration,
      zipCode,
      rpoInterested,
      contactInfo,
      totalCost: calculateTotalCost(),
      selectedAttachments,
    };

    // Save reservation to localStorage
    if (typeof window !== "undefined") {
      const existingReservations = JSON.parse(
        localStorage.getItem("reservations") || "[]"
      );
      existingReservations.push(reservationData);
      localStorage.setItem(
        "reservations",
        JSON.stringify(existingReservations)
      );
    }

    // Send email notification
    try {
      const emailPayload = {
        type: "booking",
        customerEmail: contactInfo.email,
        customerName: contactInfo.name,
        customerPhone: contactInfo.phone,
        businessName: contactInfo.businessName,
        address: contactInfo.address,
        city: contactInfo.city,
        state: contactInfo.state,
        zipCode: contactInfo.zipCode,
        machineId: machine.id,
        machineName: `${machine.make} ${machine.model}`.trim(),
        machineYear: machine.year?.toString(),
        machineMake: machine.make,
        machineModel: machine.model,
        machineType: machine.primaryType,
        startDate: startDate!.toLocaleDateString(),
        duration,
        rpoInterested,
        totalCost: calculateTotalCost(),
        attachments:
          machine.relatedAttachments
            ?.filter((att) => {
              const attachmentName = att.name || att.displayName || "";
              return selectedAttachments.includes(attachmentName);
            })
            .map((att) => {
              const {
                daily: attDaily,
                weekly: attWeekly,
                monthly: attMonthly,
              } = getAttachmentRates(att);
              return {
                name: att.name || att.displayName || "",
                make: att.make || "",
                model: att.model || "",
                pricing: {
                  dailyRate: attDaily,
                  weeklyRate: attWeekly,
                  monthlyRate: attMonthly,
                },
              };
            }) || [],
      };

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(
          `Failed to send email: ${errorData.error || "Unknown error"}`
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
    } catch (error) {
      console.error("Error sending email:", error);
      // In development mode, don't block the user flow
      if (process.env.NODE_ENV === "development") {
        console.log("Email error ignored in development mode");
      }
      // Don't block the user flow, just log the error
    }
  };

  const resetModal = () => {
    setCurrentStep(0);
    setStartDate(undefined);
    setDuration(7);
    setZipCode("");
    setRpoInterested(false);
    setSelectedAttachments([]);
  };

  const handleClose = () => {
    onClose();
    resetModal();
    // If on step 3 (confirmation), redirect to search results
    if (currentStep === 2) {
      router.push("/");
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Handle phone formatting
      handlePhoneInputChange(value, (formattedPhone) => {
        setContactInfo({ ...contactInfo, phone: formattedPhone });
        setErrors((prev) => ({
          ...prev,
          phone:
            formattedPhone && !validatePhone(formattedPhone)
              ? "Phone number must be 10 digits"
              : undefined,
        }));
      });
    } else if (name === "email") {
      setContactInfo({ ...contactInfo, email: value });
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value) ? undefined : "Invalid email address",
      }));
    } else {
      setContactInfo({ ...contactInfo, [name]: value });
    }
  };

  // Add to Cart handler for no attachments
  const handleAddToCartNoAttachments = () => {
    // Add machine to cart
    const cartItem = {
      machineId: machine.id,
      machineName: `${machine.make} ${machine.model}`.trim(),
      machine: machine,
      selectedAttachments: [],
      quantity: 1,
    };
    if (typeof window !== "undefined") {
      try {
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

        // Check if item already exists (same machine, no attachments)
        const existingItemIndex = existingCart.findIndex(
          (item: any) =>
            item &&
            item.machineId === machine.id &&
            (!item.selectedAttachments || item.selectedAttachments.length === 0)
        );

        if (existingItemIndex !== -1) {
          // Update quantity of existing item
          existingCart[existingItemIndex].quantity =
            (existingCart[existingItemIndex].quantity || 1) + 1;
        } else {
          // Add as new item
          existingCart.push(cartItem);
        }

        localStorage.setItem("cart", JSON.stringify(existingCart));
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        setShowAddedPopup(true);
      } catch (error) {
        alert("Error adding machine to cart. Please try again.");
      }
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label
          htmlFor="startDate"
          className="text-base font-medium text-gray-900"
        >
          Select start date
        </Label>
        <p className="text-sm text-gray-600 mb-3">
          Must be within 30 days of today's date.
        </p>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            disabled={(date) =>
              date < new Date() || date > addDays(new Date(), 30)
            }
            className="
                            p-6
                            bg-white
                            rounded-lg 
                            border border-gray-200 
                            shadow-sm 
                            max-w-full
                        "
            classNames={{
              months: "flex flex-col space-y-4",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center mb-4",
              caption_label: "text-sm font-medium text-gray-900",
              nav: "space-x-1 flex items-center",
              nav_button:
                "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 border-0 hover:bg-gray-100 rounded",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "grid grid-cols-7 gap-1 mb-2",
              head_cell:
                "text-center text-xs font-medium text-gray-500 py-2 w-10",
              row: "grid grid-cols-7 gap-1",
              cell: "flex items-center justify-center p-0",
              day: "h-10 w-10 p-0 font-normal text-gray-900 hover:bg-gray-100 focus:bg-gray-100 rounded data-[selected]:bg-gray-900 data-[selected]:text-white data-[selected]:hover:bg-gray-900 data-[today]:bg-gray-100 data-[today]:text-gray-900 data-[today]:font-medium data-[outside-month]:text-gray-400 data-[disabled]:text-gray-300 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
            }}
          />
        </div>
      </div>

      <DurationSelector
        value={duration}
        onChange={setDuration}
        label="Select rental duration"
        description="This is only an estimate. Keep the machine as long as needed."
      />

      <div>
        <Label
          htmlFor="zipCode"
          className="text-base font-medium text-gray-900"
        >
          Enter Destination Zip Code
        </Label>
        <Input
          id="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Enter zip code"
          maxLength={5}
          className="bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {machine.rpoEnabled && (
        <div>
          <Label className="text-base font-medium text-gray-900">
            Are you wanting to Rent to Own?
          </Label>
          <div className="flex gap-2 mt-2">
            <Button
              variant={rpoInterested ? "default" : "outline"}
              onClick={() => setRpoInterested(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check className="h-4 w-4" />
              Yes
            </Button>
            <Button
              variant={!rpoInterested ? "default" : "outline"}
              onClick={() => setRpoInterested(false)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900"
            >
              <X className="h-4 w-4" />
              No
            </Button>
          </div>
        </div>
      )}

      {machine.relatedAttachments && machine.relatedAttachments.length > 0 && (
        <div>
          <Label className="text-base font-medium text-gray-900">
            Available Attachments (Optional)
          </Label>
          <p className="text-sm text-gray-600 mb-3">
            Select any attachments you'd like to include with your rental.
          </p>
          <div className="space-y-2">
            {machine.relatedAttachments.map((attachment, index) => {
              const attachmentName =
                attachment.name ||
                attachment.displayName ||
                `Attachment ${index + 1}`;
              const isSelected = selectedAttachments.includes(attachmentName);
              const {
                daily: attDaily,
                weekly: attWeekly,
                monthly: attMonthly,
              } = getAttachmentRates(attachment);
              const hasPricing = attDaily || attWeekly || attMonthly;

              return (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    id={`attachment-${index}`}
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAttachments([
                          ...selectedAttachments,
                          attachmentName,
                        ]);
                      } else {
                        setSelectedAttachments(
                          selectedAttachments.filter(
                            (name) => name !== attachmentName
                          )
                        );
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label
                    htmlFor={`attachment-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium text-gray-900">
                      {attachmentName}
                    </div>
                    {(attachment.make || attachment.model) && (
                      <div className="text-sm text-gray-600">
                        {attachment.make} {attachment.model}
                      </div>
                    )}
                    {hasPricing && (
                      <div className="text-sm text-blue-600 mt-1">
                        {attDaily && `$${attDaily}/day`}
                        {attDaily && attWeekly && " • "}
                        {attWeekly && `$${attWeekly}/week`}
                        {(attDaily || attWeekly) && attMonthly && " • "}
                        {attMonthly && `$${attMonthly}/month`}
                      </div>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
          {selectedAttachments.length > 0 && (
            <div className="mt-2 p-2 bg-blue-100 rounded">
              <div className="text-sm text-blue-800">
                <strong>Selected:</strong> {selectedAttachments.join(", ")}
              </div>
            </div>
          )}
        </div>
      )}
      {(!machine.relatedAttachments ||
        machine.relatedAttachments.length === 0) && (
        <div className="flex justify-end mt-6">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleAddToCartNoAttachments}
          >
            Add to Cart
          </Button>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-gray-900">
            Full Name *
          </Label>
          <Input
            id="name"
            value={contactInfo.name}
            onChange={(e) =>
              setContactInfo({ ...contactInfo, name: e.target.value })
            }
            placeholder="Enter your full name"
            className="bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label htmlFor="phone" className="text-gray-900">
            Phone <span className="text-red-400">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            value={contactInfo.phone}
            onChange={handleContactChange}
            required
            className="bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.phone && (
            <div className="text-red-400 text-xs mt-1">{errors.phone}</div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-gray-900">
          Email <span className="text-red-400">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={contactInfo.email}
          onChange={handleContactChange}
          required
          className="bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.email && (
          <div className="text-red-400 text-xs mt-1">{errors.email}</div>
        )}
      </div>

      <div>
        <Label htmlFor="businessName" className="text-gray-900">
          Business Name (Optional)
        </Label>
        <Input
          id="businessName"
          value={contactInfo.businessName || ""}
          onChange={(e) =>
            setContactInfo({ ...contactInfo, businessName: e.target.value })
          }
          placeholder="Your Company Name"
          className="bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <Label htmlFor="address" className="text-gray-900">
          Jobsite Address *
        </Label>
        <Input
          id="address"
          value={contactInfo.address}
          onChange={(e) =>
            setContactInfo({ ...contactInfo, address: e.target.value })
          }
          placeholder="123 Main Street"
          className="bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="text-gray-900">
            City *
          </Label>
          <Input
            id="city"
            value={contactInfo.city}
            onChange={(e) =>
              setContactInfo({ ...contactInfo, city: e.target.value })
            }
            placeholder="City"
            className="bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label htmlFor="state" className="text-gray-900">
            State *
          </Label>
          <Input
            id="state"
            value={contactInfo.state}
            onChange={(e) =>
              setContactInfo({ ...contactInfo, state: e.target.value })
            }
            placeholder="LA"
            maxLength={2}
            className="bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contactZipCode" className="text-gray-900">
          Zip Code *
        </Label>
        <Input
          id="contactZipCode"
          value={contactInfo.zipCode}
          onChange={(e) =>
            setContactInfo({ ...contactInfo, zipCode: e.target.value })
          }
          placeholder="07103"
          maxLength={5}
          className="bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Enhanced Summary */}
      <Card className="mt-6 bg-gray-50 border border-gray-200">
        <CardHeader className="border-b border-gray-200 pb-4">
          <CardTitle className="text-lg text-gray-900">
            Rental Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">
                {machine.make} {machine.model}
              </span>
              <span className="text-xl font-bold text-blue-600">
                {getCostDisplay()}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Start Date:</span>
                <span>
                  {startDate ? format(startDate, "MMM dd, yyyy") : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{getDurationDisplay()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Zip:</span>
                <span>{zipCode}</span>
              </div>
              {selectedAttachments.length > 0 && (
                <div className="border-t border-gray-200 pt-2 space-y-1">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    Selected Attachments:
                  </div>
                  {machine.relatedAttachments
                    ?.filter((att) => {
                      const attachmentName = att.name || att.displayName || "";
                      return selectedAttachments.includes(attachmentName);
                    })
                    .map((attachment, idx) => {
                      const attachmentName =
                        attachment.name || attachment.displayName || "";
                      const {
                        daily: attDaily,
                        weekly: attWeekly,
                        monthly: attMonthly,
                      } = getAttachmentRates(attachment);

                      // Calculate attachment cost for this duration
                      let attachmentCost = 0;
                      const actualDuration = Math.min(duration, 180);

                      if (actualDuration >= 180) {
                        if (attMonthly) attachmentCost = attMonthly * 6;
                        else if (attWeekly) attachmentCost = attWeekly * 26;
                        else if (attDaily) attachmentCost = attDaily * 180;
                      } else if (actualDuration >= 30) {
                        if (attMonthly)
                          attachmentCost =
                            attMonthly * Math.ceil(actualDuration / 30);
                        else if (attWeekly)
                          attachmentCost =
                            attWeekly * Math.ceil(actualDuration / 7);
                        else if (attDaily)
                          attachmentCost = attDaily * actualDuration;
                      } else if (actualDuration >= 7) {
                        if (attWeekly)
                          attachmentCost =
                            attWeekly * Math.ceil(actualDuration / 7);
                        else if (attDaily)
                          attachmentCost = attDaily * actualDuration;
                        else if (attMonthly)
                          attachmentCost =
                            attMonthly * Math.ceil(actualDuration / 30);
                      } else {
                        if (attDaily)
                          attachmentCost = attDaily * actualDuration;
                        else if (attWeekly)
                          attachmentCost =
                            attWeekly * Math.ceil(actualDuration / 7);
                        else if (attMonthly)
                          attachmentCost =
                            attMonthly * Math.ceil(actualDuration / 30);
                      }

                      return (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{attachmentName}</span>
                          <span>
                            {attachmentCost > 0
                              ? `$${attachmentCost.toFixed(0)}`
                              : "Included"}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
            {duration >= 180 && (
              <div className="bg-blue-100 p-2 rounded text-xs text-blue-800">
                <Info className="inline mr-1 h-3 w-3" />
                6+ month pricing estimate. Final cost will be calculated based
                on actual rental duration.
              </div>
            )}
            {rpoInterested && (
              <Badge className="text-xs bg-blue-100 text-blue-800">
                <Info className="mr-1 h-3 w-3" /> Rent to Own Interest
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="text-blue-600 text-6xl">✓</div>
      <h3 className="text-2xl font-bold text-gray-900">
        Thank You for Your Reservation!
      </h3>
      <div className="space-y-3">
        <p className="text-gray-600 text-lg">
          Your reservation for the {machine.make} {machine.model} has been
          successfully submitted.
        </p>
        <p className="text-gray-600">
          <strong>
            A service representative will be in touch with you shortly
          </strong>{" "}
          to confirm details and arrange delivery.
        </p>
        <p className="text-gray-600">
          <strong>An email confirmation will be sent</strong> to{" "}
          {contactInfo.email} with your reservation details.
        </p>
      </div>

      <Card className="bg-blue-100 border border-blue-200">
        <CardContent className="pt-6">
          <div className="text-left space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">Machine:</span>
              <span className="text-gray-600">
                {machine.make} {machine.model}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">Start Date:</span>
              <span className="text-gray-600">
                {startDate ? format(startDate, "MMM dd, yyyy") : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">Duration:</span>
              <span className="text-gray-600">{getDurationDisplay()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">Contact:</span>
              <span className="text-gray-600">{contactInfo.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">Email:</span>
              <span className="text-gray-600">{contactInfo.email}</span>
            </div>
            {contactInfo.businessName && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Business:</span>
                <span className="text-gray-600">
                  {contactInfo.businessName}
                </span>
              </div>
            )}
            {selectedAttachments.length > 0 && (
              <div className="border-t border-gray-200 pt-2 space-y-1">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Selected Attachments:
                </div>
                {machine.relatedAttachments
                  ?.filter((att) => {
                    const attachmentName = att.name || att.displayName || "";
                    return selectedAttachments.includes(attachmentName);
                  })
                  .map((attachment, idx) => {
                    const attachmentName =
                      attachment.name || attachment.displayName || "";
                    const {
                      daily: attDaily,
                      weekly: attWeekly,
                      monthly: attMonthly,
                    } = getAttachmentRates(attachment);

                    // Calculate attachment cost for this duration
                    let attachmentCost = 0;
                    const actualDuration = Math.min(duration, 180);

                    if (actualDuration >= 180) {
                      if (attMonthly) attachmentCost = attMonthly * 6;
                      else if (attWeekly) attachmentCost = attWeekly * 26;
                      else if (attDaily) attachmentCost = attDaily * 180;
                    } else if (actualDuration >= 30) {
                      if (attMonthly)
                        attachmentCost =
                          attMonthly * Math.ceil(actualDuration / 30);
                      else if (attWeekly)
                        attachmentCost =
                          attWeekly * Math.ceil(actualDuration / 7);
                      else if (attDaily)
                        attachmentCost = attDaily * actualDuration;
                    } else if (actualDuration >= 7) {
                      if (attWeekly)
                        attachmentCost =
                          attWeekly * Math.ceil(actualDuration / 7);
                      else if (attDaily)
                        attachmentCost = attDaily * actualDuration;
                      else if (attMonthly)
                        attachmentCost =
                          attMonthly * Math.ceil(actualDuration / 30);
                    } else {
                      if (attDaily) attachmentCost = attDaily * actualDuration;
                      else if (attWeekly)
                        attachmentCost =
                          attWeekly * Math.ceil(actualDuration / 7);
                      else if (attMonthly)
                        attachmentCost =
                          attMonthly * Math.ceil(actualDuration / 30);
                    }

                    return (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-900">{attachmentName}</span>
                        <span className="text-gray-600">
                          {attachmentCost > 0
                            ? `$${attachmentCost.toFixed(0)}`
                            : "Included"}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col bg-white border border-gray-200 shadow-lg">
          <DialogHeader className="flex-shrink-0 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              {currentStep > 0 && currentStep < 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <DialogTitle className="text-gray-900">
                {steps[currentStep].title}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-6 px-6">
            {currentStep === 0 && renderStep1()}
            {currentStep === 1 && renderStep2()}
            {currentStep === 2 && renderStep3()}
          </div>

          <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-200 px-6 pb-6">
            <Button
              variant="outline"
              onClick={handleClose}
              className="order-2 sm:order-1"
            >
              {currentStep === 2 ? "Back to Search Results" : "Cancel"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 0 && !isStep1Valid()) ||
                (currentStep === 1 && (!isStep2Valid() || isLoading))
              }
              className="order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Processing..." : steps[currentStep].buttonText}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PopupDialog open={showAddedPopup} onOpenChange={setShowAddedPopup}>
        <PopupDialogContent className="max-w-md bg-white border border-gray-200 shadow-lg text-center">
          <div className="text-lg font-semibold text-gray-900 mb-2">
            Added to cart successfully!
          </div>
          <div className="mb-6 text-gray-700">
            Your machine has been added to the cart.
          </div>
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddedPopup(false);
                onClose();
              }}
            >
              Continue Shopping
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setShowAddedPopup(false);
                onClose();
                router.push("/cart");
              }}
            >
              Go to Checkout
            </Button>
          </div>
        </PopupDialogContent>
      </PopupDialog>
    </>
  );
}
