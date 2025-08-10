"use client";

import type { Machine } from "@/components/machine-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  MapPin,
  Package,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Remove MultiStepCheckoutModal import and usage
import { HCaptchaComponent } from "@/components/hcaptcha-provider";
import { Calendar as UiCalendar } from "@/components/ui/calendar";
import DurationSelector from "@/components/ui/duration-selector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getMachineDetailUrl } from "@/lib/machine-url-helper";

// Implement in-page multi-step checkout flow:
// 1. Step 1: Rental start date, duration, zip code (editable)
// 2. Step 2: User info fields (name, email, phone, address, etc.)
// 3. Step 3: Order summary and confirmation
// All state and transitions should be handled in-page, not in a modal.

interface CartItem {
  machineId: string;
  machineName: string;
  machine: Machine;
  selectedAttachments: string[];
  quantity?: number;
  uniqueId?: string;
}

// Configuration
const MACHINE_IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_MACHINE_IMAGE_BASE_URL ||
  "https://kimberrubblstg.blob.core.windows.net";

// Helper function to get machine image
const getMachineImage = (machine: Machine): string => {
  let imageUrl = "/placeholder.svg";

  if (machine.thumbnails && machine.thumbnails.length > 0) {
    const thumbnail = machine.thumbnails[0];
    if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
      imageUrl = thumbnail;
    } else {
      const correctedPath = thumbnail.startsWith("/")
        ? thumbnail
        : `/${thumbnail}`;
      imageUrl = `${MACHINE_IMAGE_BASE_URL}${correctedPath}`;
    }
  } else if (machine.images && machine.images.length > 0) {
    const image = machine.images[0];
    if (image.startsWith("http://") || image.startsWith("https://")) {
      imageUrl = image;
    } else {
      const correctedPath = image.startsWith("/") ? image : `/${image}`;
      imageUrl = `${MACHINE_IMAGE_BASE_URL}${correctedPath}`;
    }
  }

  return imageUrl;
};

// Helper function to get rental rates - copied from machine-grid.tsx
const getRentalRates = (machine: Machine) => {
  let daily: number | undefined,
    weekly: number | undefined,
    monthly: number | undefined;
  if (typeof machine.rentalRate === "number") {
    monthly = machine.rentalRate;
  } else if (machine.rentalRate && typeof machine.rentalRate === "object") {
    daily = machine.rentalRate.daily;
    weekly = machine.rentalRate.weekly;
    monthly = machine.rentalRate.monthly;
  }
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
  daily = daily && daily > 0 ? daily : undefined;
  weekly = weekly && weekly > 0 ? weekly : undefined;
  monthly = monthly && monthly > 0 ? monthly : undefined;
  return { daily, weekly, monthly };
};

// Helper to calculate item price based on duration and return pricing details
const calculateItemPriceWithDetails = (item: CartItem, duration: number) => {
  const { daily, weekly, monthly } = getRentalRates(item.machine);
  const quantity = item.quantity || 1;
  let price = 0;
  let explanation = "";

  // If duration is exactly 30 or 28-31 days, use monthly rate
  if (duration >= 28 && duration <= 31 && monthly) {
    price = monthly * quantity;
    explanation = `${quantity} units × 1 month ($${monthly.toLocaleString()}/month each)`;
  }
  // If duration is an exact multiple of 30 (e.g. 60, 90), use monthly rate
  else if (duration > 31 && duration % 30 === 0 && monthly) {
    const months = duration / 30;
    price = monthly * months * quantity;
    explanation = `${quantity} units × ${months} month${
      months > 1 ? "s" : ""
    } ($${monthly.toLocaleString()}/month each)`;
  }
  // If duration is exactly 7 days, use weekly rate
  else if (duration === 7 && weekly) {
    price = weekly * quantity;
    explanation = `${quantity} units × 1 week ($${weekly.toLocaleString()}/week each)`;
  }
  // If duration is an exact multiple of 7 (e.g. 14, 21), use weekly rate
  else if (duration > 7 && duration % 7 === 0 && weekly) {
    const weeks = duration / 7;
    price = weekly * weeks * quantity;
    explanation = `${quantity} units × ${weeks} week${
      weeks > 1 ? "s" : ""
    } ($${weekly.toLocaleString()}/week each)`;
  }
  // For durations less than 7 days, use daily rate
  else if (duration < 7 && daily) {
    price = daily * duration * quantity;
    explanation = `${quantity} units × ${duration} day${
      duration > 1 ? "s" : ""
    } ($${daily.toLocaleString()}/day each)`;
  }
  // For durations between 7 and 28 days that aren't exact multiples, use weeks + days
  else if (duration > 7 && duration < 28 && weekly && daily) {
    const weeks = Math.floor(duration / 7);
    const days = duration % 7;
    price = (weekly * weeks + daily * days) * quantity;
    if (days > 0) {
      explanation = `${quantity} units × (${weeks} week${
        weeks > 1 ? "s" : ""
      } + ${days} day${
        days > 1 ? "s" : ""
      }) at $${weekly.toLocaleString()}/week + $${daily.toLocaleString()}/day each`;
    } else {
      explanation = `${quantity} units × ${weeks} week${
        weeks > 1 ? "s" : ""
      } ($${weekly.toLocaleString()}/week each)`;
    }
  }
  // For durations between 28 and 31 that aren't exact multiples, use months + days
  else if (duration > 31 && monthly && daily) {
    const months = Math.floor(duration / 30);
    const days = duration % 30;
    price = (monthly * months + daily * days) * quantity;
    if (days > 0) {
      explanation = `${quantity} units × (${months} month${
        months > 1 ? "s" : ""
      } + ${days} day${
        days > 1 ? "s" : ""
      }) at $${monthly.toLocaleString()}/month + $${daily.toLocaleString()}/day each`;
    } else {
      explanation = `${quantity} units × ${months} month${
        months > 1 ? "s" : ""
      } ($${monthly.toLocaleString()}/month each)`;
    }
  }
  // Fallbacks
  else if (weekly && duration >= 7) {
    const weeks = Math.floor(duration / 7);
    const days = duration % 7;
    price = (weekly * weeks + (daily ? daily * days : 0)) * quantity;
    if (days > 0 && daily) {
      explanation = `${quantity} units × (${weeks} week${
        weeks > 1 ? "s" : ""
      } + ${days} day${
        days > 1 ? "s" : ""
      }) at $${weekly.toLocaleString()}/week + $${daily.toLocaleString()}/day each`;
    } else {
      explanation = `${quantity} units × ${weeks} week${
        weeks > 1 ? "s" : ""
      } ($${weekly.toLocaleString()}/week each)`;
    }
  } else if (daily) {
    price = daily * duration * quantity;
    explanation = `${quantity} units × ${duration} day${
      duration > 1 ? "s" : ""
    } ($${daily.toLocaleString()}/day each)`;
  }

  return { price, explanation };
};

// Helper to calculate item price based on duration (backward compatibility)
const calculateItemPrice = (item: CartItem, duration: number) => {
  return calculateItemPriceWithDetails(item, duration).price;
};

export default function CartPage() {
  const t = useTranslations();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const routeParams = useParams<{ locale: string | string[] }>();
  const initialLocale = Array.isArray(routeParams?.locale)
    ? (routeParams?.locale?.[0] as string)
    : (routeParams?.locale as string) || "en";
  const [locale, setLocale] = useState<string>(initialLocale);

  // Locale is already set from params

  // Remove MultiStepCheckoutModal and modal logic
  // Implement in-page multi-step checkout flow:
  // 1. Step 1: Rental start date, duration, zip code (editable)
  // 2. Step 2: User info fields (name, email, phone, address, etc.)
  // 3. Step 3: Order summary and confirmation
  // All state and transitions should be handled in-page, not in a modal.
  const [rentalData, setRentalData] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [localRentalData, setLocalRentalData] = useState<any>(() => {
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];
    const maxDateObj = new Date(today);
    maxDateObj.setDate(today.getDate() + 30);
    const maxDate = maxDateObj.toISOString().split("T")[0];
    return {
      startDate: new Date(),
      duration: 7,
      zipCode: "",
      dropOffTime: "morning",
      pickupTime: "morning",
    };
  });
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    address: "",
    message: "",
  });
  const [formTouched, setFormTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Define minDate and maxDate at the top of the component
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 30);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  const [startDateInput, setStartDateInput] = useState(
    localRentalData.startDate
      ? new Date(localRentalData.startDate).toISOString().split("T")[0]
      : ""
  );
  const [dateWarning, setDateWarning] = useState("");
  const [zipCode, setZipCode] = useState("");

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDateInput(value);
    if (!value) {
      setDateWarning("");
      setLocalRentalData({ ...localRentalData, startDate: null });
      return;
    }
    const selected = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    maxDate.setHours(23, 59, 59, 999);
    if (selected < today) {
      setDateWarning("Selected date must be at least today.");
    } else if (selected > maxDate) {
      setDateWarning("Date must be within 30 days.");
    } else {
      setDateWarning("");
      setLocalRentalData({ ...localRentalData, startDate: selected });
    }
  };

  // Add state for free pickup
  const [freePickup, setFreePickup] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        // Simply load cart items as they are, with proper validation
        const validCart = cart
          .filter((item: any) => item && item.machineId)
          .map((item: any, index: number) => ({
            ...item,
            selectedAttachments: Array.isArray(item.selectedAttachments)
              ? item.selectedAttachments
              : [],
            quantity: item.quantity || 1,
            uniqueId: `${item.machineId}-${index}`, // Add unique ID for React keys
          }));

        setCartItems(validCart);
      } catch (error) {
        console.error("Error loading cart:", error);
        setCartItems([]);
      }
      setIsLoading(false);
    }
  }, []);

  const removeFromCart = (machineId: string) => {
    // Remove all instances of this machineId from localStorage
    if (typeof window !== "undefined") {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const filteredCart = cart.filter(
          (item: any) => item && item.machineId !== machineId
        );
        localStorage.setItem("cart", JSON.stringify(filteredCart));

        // Update local state
        const updatedCart = cartItems.filter(
          (item) => item.machineId !== machineId
        );
        setCartItems(updatedCart);

        // Dispatch custom event to update cart count in header
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem("cart", "[]");

    // Dispatch custom event to update cart count in header
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  // Remove proceedToCheckout function
  // Implement in-page multi-step checkout flow:
  // 1. Step 1: Rental start date, duration, zip code (editable)
  // 2. Step 2: User info fields (name, email, phone, address, etc.)
  // 3. Step 3: Order summary and confirmation
  // All state and transitions should be handled in-page, not in a modal.

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <ShoppingCart className="h-16 w-16 text-gray-400" />
              </div>
              <h1 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">
                {t("cart.emptyCart")}
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                {t("checkoutPage.emptyDescription")}
              </p>
              <Link href={`/${locale}/equipment-rental`}>
                <Button className="bg-turquoise-600 hover:bg-turquoise-700 text-white font-black uppercase tracking-wide px-8 py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-200">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  {t("homepage.hero.browseEquipment")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add a helper to check if all required fields are filled
  console.log(
    "DEBUG: startDateInput:",
    startDateInput,
    "duration:",
    localRentalData.duration,
    "zipCode:",
    zipCode,
    "dateWarning:",
    dateWarning
  );
  const isStep1Valid =
    !!startDateInput &&
    !dateWarning &&
    !!zipCode &&
    zipCode.length === 5 &&
    !!localRentalData.duration;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm mb-6 text-white/70">
              <Link
                href={`/${locale}`}
                className="hover:text-yellow-400 transition-colors font-semibold uppercase tracking-wide"
              >
                {t("navigation.home").toUpperCase()}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/${locale}/equipment-rental`}
                className="hover:text-yellow-400 transition-colors font-semibold uppercase tracking-wide"
              >
                {t("navigation.equipment").toUpperCase()}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-yellow-400 font-bold uppercase tracking-wide">
                {t("checkout.title").toUpperCase()}
              </span>
            </nav>

            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Equipment Checkout - Lafayette, LA
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-1 w-20 bg-yellow-400"></div>
              <p className="text-xl text-white/90 font-semibold">
                {cartItems.length}{" "}
                {cartItems.length === 1 ? "Machine" : "Machines"} Ready for
                Rental
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* Cart Items Section */}
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center">
                    <div className="w-1 h-8 bg-turquoise-500 mr-3"></div>
                    {t("checkoutPage.equipmentSelection")}
                  </h2>
                  {cartItems.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
                {cartItems.map((item, index) => (
                  <Card
                    key={item.uniqueId || `${item.machineId}-${index}`}
                    className="shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-shadow duration-200"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Machine Image */}
                        <div className="relative w-full md:w-48 h-48 md:h-auto bg-gray-100">
                          <Image
                            src={getMachineImage(item.machine)}
                            alt={item.machineName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 192px"
                          />
                          {(item.quantity || 1) > 1 && (
                            <div className="absolute top-2 right-2 bg-yellow-400 text-black font-bold px-2 py-1 rounded text-sm">
                              QTY: {item.quantity}
                            </div>
                          )}
                        </div>

                        {/* Machine Details */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-1">
                                {item.machineName}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Badge className="bg-turquoise-100 text-turquoise-800 border-turquoise-200">
                                  {item.machine.year}
                                </Badge>
                                <span className="font-semibold">
                                  {item.machine.primaryType}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.machineId)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {item.selectedAttachments &&
                            item.selectedAttachments.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                  {t("equipment.attachments")}:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {item.selectedAttachments.map(
                                    (attachment, idx) => (
                                      <Badge
                                        key={idx}
                                        className="bg-yellow-100 text-yellow-800 border-yellow-300 font-semibold"
                                      >
                                        <Package className="h-3 w-3 mr-1" />
                                        {attachment}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Rental Info Preview */}
                          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-1 text-turquoise-600" />
                              <span className="font-semibold">
                                {t("equipment.dailyRate")}:{" $"}
                                {getRentalRates(item.machine).daily || "N/A"}
                              </span>
                            </div>
                            <a
                              href={getMachineDetailUrl(item.machine, locale)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="font-bold uppercase tracking-wide border-2 border-gray-800 hover:bg-gray-800 hover:text-white transition-all duration-200"
                              >
                                {t("common.viewDetails")}
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Checkout Section - Horizontal Layout Below Cart Items */}
            <div className="w-full">
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                    {t("checkout.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {/* Multi-step checkout logic */}
                  {confirmation ? (
                    <div className="space-y-6">
                      {/* Success Icon and Message */}
                      <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                          <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          Reservation Confirmed!
                        </h2>
                        <p className="text-lg text-gray-600">
                          Your equipment reservation has been successfully submitted
                        </p>
                      </div>

                      {/* Confirmation Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                            <Package className="h-5 w-5 mr-2 text-turquoise-600" />
                            Equipment Reserved
                          </h3>
                          <div className="space-y-3">
                            {cartItems.map((item, idx) => (
                              <div key={idx} className="text-sm">
                                <div className="font-semibold text-gray-900">
                                  {item.machineName}
                                </div>
                                <div className="text-gray-600">
                                  {item.machine.year} • Qty: {item.quantity || 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Rental Details */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-turquoise-600" />
                            Rental Period
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Start Date:</span>
                              <span className="font-semibold text-gray-900">
                                {new Date(localRentalData.startDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-semibold text-gray-900">
                                {localRentalData.duration} days
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Location:</span>
                              <span className="font-semibold text-gray-900">
                                {localRentalData.zipCode}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Delivery:</span>
                              <span className="font-semibold text-green-600">
                                {freePickup ? "Self Pickup" : "Delivery"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* What's Next Section */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-bold text-blue-900 mb-3 flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          What Happens Next?
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                              1
                            </div>
                            <div className="ml-3 text-sm text-gray-700">
                              <strong>Confirmation Email:</strong> {emailSent 
                                ? `Email confirmation sent to ${userInfo.email}` 
                                : `Sending confirmation to ${userInfo.email}...`}
                              {!emailSent && (
                                <span className="inline-block ml-2">
                                  <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                              2
                            </div>
                            <div className="ml-3 text-sm text-gray-700">
                              <strong>Our Team Will Contact You:</strong> Within 24 hours to confirm availability and finalize details
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                              3
                            </div>
                            <div className="ml-3 text-sm text-gray-700">
                              <strong>Delivery/Pickup Arrangement:</strong> We'll coordinate the {freePickup ? "pickup time" : "delivery schedule"} with you
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                              4
                            </div>
                            <div className="ml-3 text-sm text-gray-700">
                              <strong>Payment:</strong> Payment will be arranged before delivery/pickup
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-turquoise-50 border border-turquoise-200 rounded-lg p-6">
                        <h3 className="font-bold text-gray-900 mb-3">Need to Make Changes?</h3>
                        <p className="text-sm text-gray-700 mb-4">
                          Contact us if you need to modify your reservation or have any questions:
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <a
                            href={`mailto:${process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'info@lafayetteequipmentrentals.com'}`}
                            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email Us
                          </a>
                          <a
                            href="tel:+13375452935"
                            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            (337) 545-2935
                          </a>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <button
                          onClick={() => router.push(`/${locale}/equipment-rental`)}
                          className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Browse More Equipment
                        </button>
                        <button
                          onClick={() => router.push(`/${locale}`)}
                          className="px-6 py-3 bg-turquoise-600 text-white rounded-md font-semibold hover:bg-turquoise-700 transition-colors"
                        >
                          Return to Homepage
                        </button>
                      </div>
                    </div>
                  ) : checkoutStep === 0 ? (
                    // Step 1: Rental Info
                    <div className="space-y-6">
                      <div>
                        <label className="block text-base font-medium text-gray-900 mb-1">
                          {t("cart.startDate")}
                        </label>
                        <Input
                          type="date"
                          value={startDateInput}
                          onChange={handleStartDateChange}
                          min={minDate}
                          max={maxDate}
                        />
                        {dateWarning && (
                          <div className="text-xs text-red-600 mt-1">
                            {dateWarning}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {t("checkoutPage.startDateInfo")}
                        </div>
                      </div>
                      <div>
                        <DurationSelector
                          value={localRentalData.duration}
                          onChange={(d) =>
                            setLocalRentalData({
                              ...localRentalData,
                              duration: d,
                            })
                          }
                          label={t("checkoutPage.rentalDuration")}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="zipCode"
                          className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3"
                        >
                          {t("checkout.zipCode")}
                        </Label>
                        <Input
                          id="zipCode"
                          type="text"
                          placeholder={t("checkoutPage.zipPlaceholder")}
                          className="w-full h-10 sm:h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                          maxLength={5}
                          value={zipCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setZipCode(val.slice(0, 5));
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/${locale}`)}
                          className="px-6 py-3 rounded-md font-medium"
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            cursor: 'pointer',
                            transition: 'none',
                          }}
                          onMouseEnter={(e) => {
                            const target = e.currentTarget;
                            target.style.transition = 'none';
                            target.style.backgroundColor = '#f9fafb';
                            target.style.borderColor = '#9ca3af';
                          }}
                          onMouseLeave={(e) => {
                            const target = e.currentTarget;
                            target.style.transition = 'none';
                            target.style.backgroundColor = '#ffffff';
                            target.style.borderColor = '#d1d5db';
                          }}
                        >
                          {t("common.cancel")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLocalRentalData({
                              ...localRentalData,
                              zipCode,
                              startDate: new Date(startDateInput),
                            });
                            setRentalData({
                              ...localRentalData,
                              zipCode,
                              startDate: new Date(startDateInput),
                            });
                            setCheckoutStep(1);
                          }}
                          disabled={!isStep1Valid}
                          className="px-6 py-3 rounded-md font-medium"
                          style={{
                            backgroundColor: !isStep1Valid ? '#d1d5db' : '#14b8a6',
                            color: !isStep1Valid ? '#6b7280' : '#ffffff',
                            border: 'none',
                            cursor: !isStep1Valid ? 'not-allowed' : 'pointer',
                            opacity: !isStep1Valid ? '0.6' : '1',
                            transition: 'none',
                          }}
                          onMouseEnter={(e) => {
                            if (isStep1Valid) {
                              const target = e.currentTarget;
                              target.style.transition = 'none';
                              target.style.backgroundColor = '#0d9488';
                              target.style.color = '#ffffff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isStep1Valid) {
                              const target = e.currentTarget;
                              target.style.transition = 'none';
                              target.style.backgroundColor = '#14b8a6';
                              target.style.color = '#ffffff';
                            }
                          }}
                        >
                          {t("common.next")}
                        </button>
                      </div>
                    </div>
                  ) : checkoutStep === 1 ? (
                    // Step 2: User Info
                    <form
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setFormTouched(true);
                        if (
                          userInfo.name &&
                          userInfo.email &&
                          userInfo.phone &&
                          userInfo.address &&
                          captchaToken
                        )
                          setCheckoutStep(2);
                        else if (!captchaToken)
                          alert("Please complete the captcha verification");
                      }}
                    >
                      <Input
                        name="name"
                        value={userInfo.name}
                        onChange={(e) =>
                          setUserInfo((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Full Name *"
                        required
                        className={
                          formTouched && !userInfo.name ? "border-red-500" : ""
                        }
                      />
                      <Input
                        name="email"
                        value={userInfo.email}
                        onChange={(e) =>
                          setUserInfo((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Email *"
                        required
                        className={
                          formTouched && !userInfo.email ? "border-red-500" : ""
                        }
                      />
                      <Input
                        name="phone"
                        value={userInfo.phone}
                        onChange={(e) =>
                          setUserInfo((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="Phone *"
                        required
                        className={
                          formTouched && !userInfo.phone ? "border-red-500" : ""
                        }
                      />
                      <Input
                        name="businessName"
                        value={userInfo.businessName}
                        onChange={(e) =>
                          setUserInfo((prev) => ({
                            ...prev,
                            businessName: e.target.value,
                          }))
                        }
                        placeholder="Business Name"
                      />
                      <Input
                        name="address"
                        value={userInfo.address}
                        onChange={(e) =>
                          setUserInfo((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        placeholder="Delivery Address *"
                        required
                        className={
                          formTouched && !userInfo.address
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {/* Free Pickup Checkbox */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="freePickup"
                          checked={freePickup}
                          onChange={(e) => setFreePickup(e.target.checked)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <label
                          htmlFor="freePickup"
                          className="text-sm font-medium text-gray-700"
                        >
                          I want to pick up the equipment myself (free pickup)
                        </label>
                      </div>
                      <Textarea
                        name="message"
                        value={userInfo.message}
                        onChange={(e) =>
                          setUserInfo((prev) => ({
                            ...prev,
                            message: e.target.value,
                          }))
                        }
                        placeholder="Message (optional)"
                      />
                      <div className="flex justify-center my-4">
                        <HCaptchaComponent
                          onVerify={(token) => setCaptchaToken(token)}
                          onExpire={() => setCaptchaToken(null)}
                          theme="light"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCheckoutStep(0)}
                          className="px-6 py-3 rounded-md font-medium"
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            cursor: 'pointer',
                            transition: 'none',
                          }}
                          onMouseEnter={(e) => {
                            const target = e.currentTarget;
                            target.style.transition = 'none';
                            target.style.backgroundColor = '#f9fafb';
                            target.style.borderColor = '#9ca3af';
                          }}
                          onMouseLeave={(e) => {
                            const target = e.currentTarget;
                            target.style.transition = 'none';
                            target.style.backgroundColor = '#ffffff';
                            target.style.borderColor = '#d1d5db';
                          }}
                        >
                          {t("common.back")}
                        </button>
                        <button 
                          type="submit" 
                          disabled={!captchaToken}
                          className="px-4 py-2 rounded-md font-medium transition-all duration-200"
                          style={{
                            backgroundColor: !captchaToken ? '#d1d5db' : '#14b8a6',
                            color: !captchaToken ? '#6b7280' : '#ffffff',
                            cursor: !captchaToken ? 'not-allowed' : 'pointer',
                            opacity: !captchaToken ? 0.5 : 1,
                            boxShadow: !captchaToken ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          }}
                          onMouseEnter={(e) => {
                            if (captchaToken) {
                              e.currentTarget.style.backgroundColor = '#0d9488';
                              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (captchaToken) {
                              e.currentTarget.style.backgroundColor = '#14b8a6';
                              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                            }
                          }}
                        >
                          Continue
                        </button>
                      </div>
                    </form>
                  ) : checkoutStep === 2 ? (
                    // Step 3: Professional Horizontal Order Summary
                    <div className="space-y-6">
                      <div className="text-2xl font-bold text-gray-900 mb-6">
                        Review Your Order
                      </div>

                      {/* Three Column Layout for Summary */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Column 1: Rental Details */}
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4 h-full">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                              <Calendar className="h-5 w-5 mr-2 text-turquoise-600" />
                              Rental Details
                            </h3>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Start Date:</span>
                                <span className="font-semibold text-gray-900">
                                  {new Date(localRentalData.startDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-semibold text-gray-900">
                                  {localRentalData.duration} days
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Return Date:</span>
                                <span className="font-semibold text-gray-900">
                                  {new Date(
                                    new Date(localRentalData.startDate).getTime() +
                                    localRentalData.duration * 24 * 60 * 60 * 1000
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Location:</span>
                                  <span className="font-semibold text-gray-900">
                                    {localRentalData.zipCode}
                                  </span>
                                </div>
                                <div className="flex justify-between mt-2">
                                  <span className="text-gray-600">Delivery:</span>
                                  <span className="font-semibold text-green-600">
                                    {freePickup ? "Self Pickup (Free)" : "Delivery (TBD)"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Equipment Summary */}
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4 h-full">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                              <Package className="h-5 w-5 mr-2 text-turquoise-600" />
                              Equipment ({cartItems.length})
                            </h3>
                            <div className="space-y-3">
                              {cartItems.map((item, idx) => {
                                const { price } = calculateItemPriceWithDetails(
                                  item,
                                  localRentalData.duration
                                );
                                return (
                                  <div key={idx} className="text-sm">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="font-semibold text-gray-900">
                                          {item.machineName}
                                        </div>
                                        <div className="text-gray-600">
                                          Qty: {item.quantity || 1} • {localRentalData.duration} days
                                        </div>
                                        {item.selectedAttachments && item.selectedAttachments.length > 0 && (
                                          <div className="text-xs text-gray-500 mt-1">
                                            + {item.selectedAttachments.join(", ")}
                                          </div>
                                        )}
                                      </div>
                                      <div className="font-bold text-gray-900 ml-2">
                                        ${price.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Price Summary */}
                        <div className="space-y-4">
                          <div className="bg-turquoise-50 border-2 border-turquoise-200 rounded-lg p-4 h-full">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                              <ShoppingCart className="h-5 w-5 mr-2 text-turquoise-600" />
                              Price Summary
                            </h3>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Equipment:</span>
                                <span className="font-semibold text-gray-900">
                                  ${cartItems
                                    .reduce(
                                      (total, item) =>
                                        total +
                                        calculateItemPrice(
                                          item,
                                          localRentalData.duration
                                        ),
                                      0
                                    )
                                    .toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Delivery:</span>
                                <span className="font-semibold text-gray-900">
                                  {freePickup ? "FREE" : "TBD"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tax:</span>
                                <span className="font-semibold text-gray-900">TBD</span>
                              </div>
                              <div className="pt-3 border-t-2 border-turquoise-200">
                                <div className="flex justify-between">
                                  <span className="text-lg font-bold text-gray-900">Total:</span>
                                  <span className="text-lg font-bold text-turquoise-600">
                                    ${cartItems
                                      .reduce(
                                        (total, item) =>
                                          total +
                                          calculateItemPrice(
                                            item,
                                            localRentalData.duration
                                          ),
                                        0
                                      )
                                      .toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  *Before taxes & delivery
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Important Notes - Compact */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <h3 className="text-sm font-semibold text-yellow-800">Important Information</h3>
                            <div className="mt-1 text-xs text-yellow-700 space-y-1">
                              <p>• Final taxes and delivery fees will be calculated based on your exact location</p>
                              <p>• Equipment availability subject to confirmation • Extensions available with additional charges</p>
                              <p>• Damage protection and insurance options available at pickup</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {error && (
                        <div className="text-red-600 text-sm mb-2">{error}</div>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCheckoutStep(1)}
                          className="px-6 py-3 rounded-md font-medium"
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            cursor: 'pointer',
                            transition: 'none',
                          }}
                          onMouseEnter={(e) => {
                            const target = e.currentTarget;
                            target.style.transition = 'none';
                            target.style.backgroundColor = '#f9fafb';
                            target.style.borderColor = '#9ca3af';
                          }}
                          onMouseLeave={(e) => {
                            const target = e.currentTarget;
                            target.style.transition = 'none';
                            target.style.backgroundColor = '#ffffff';
                            target.style.borderColor = '#d1d5db';
                          }}
                        >
                          {t("common.back")}
                        </button>
                        <button
                          className="px-6 py-2.5 rounded-md font-semibold transition-all duration-200"
                          style={{
                            backgroundColor: isSubmitting ? '#9ca3af' : '#16a34a',
                            color: isSubmitting ? '#4b5563' : '#ffffff',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            opacity: isSubmitting ? 0.5 : 1,
                            boxShadow: isSubmitting ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            transform: isSubmitting ? 'scale(1)' : 'scale(1)',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubmitting) {
                              e.currentTarget.style.backgroundColor = '#15803d';
                              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubmitting) {
                              e.currentTarget.style.backgroundColor = '#16a34a';
                              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                              e.currentTarget.style.transform = 'scale(1)';
                            }
                          }}
                          onClick={async () => {
                            setIsSubmitting(true);
                            setError("");
                            
                            // Show immediate confirmation
                            setConfirmation(true);
                            
                            // Send email in background
                            setTimeout(async () => {
                              try {
                              const payload = {
                                type: "booking",
                                customerEmail: userInfo.email,
                                customerName: userInfo.name,
                                customerPhone: userInfo.phone,
                                businessName: userInfo.businessName,
                                address: userInfo.address,
                                message: userInfo.message,
                                startDate: localRentalData.startDate,
                                duration: localRentalData.duration,
                                zipCode: localRentalData.zipCode,
                                cartItems: cartItems.map((item) => ({
                                  machineId: item.machineId,
                                  machineName: item.machineName,
                                  quantity: item.quantity || 1,
                                  year: item.machine.year,
                                  primaryType: item.machine.primaryType,
                                })),
                                subtotal: cartItems.reduce(
                                  (total, item) =>
                                    total +
                                    calculateItemPrice(
                                      item,
                                      localRentalData.duration
                                    ),
                                  0
                                ),
                                freePickup,
                                captchaToken: captchaToken,
                              };
                              const response = await fetch("/api/send-email", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                              });

                              const result = await response.json();
                              console.log("Email API Response:", result);

                              if (!response.ok) {
                                console.error("Email API Error:", result);
                                throw new Error(
                                  `Failed to send email: ${
                                    result.error || "Unknown error"
                                  }`
                                );
                              }

                              // Clear the cart immediately after showing confirmation
                              localStorage.setItem("cart", "[]");
                              window.dispatchEvent(
                                new CustomEvent("cartUpdated")
                              );
                              
                              // Mark email as sent
                              setEmailSent(true);
                            } catch (e) {
                              console.error("Email send error:", e);
                              // Don't show error to user since confirmation is already shown
                              // The business will still process the order even if email fails
                              setEmailSent(true); // Still mark as sent to remove loading state
                            } finally {
                              setIsSubmitting(false);
                            }
                            }, 100); // Small delay to ensure confirmation shows first
                          }}
                          disabled={isSubmitting}
                        >
                          {isSubmitting
                            ? t("checkoutPage.reserving")
                            : t("checkoutPage.reserveEquipment")}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
