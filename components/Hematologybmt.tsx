"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Heart,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Stethoscope,
  Cake,
  Mail,
  Calendar,
  Clock,
  X,
} from "lucide-react";
import { BookedSlots } from "@/actions/BookSlots";
import Image from "next/image";
import { SubmitHandlerBMT } from "@/actions/SubmitHandlers";
import AppointmentBookingFormSkeleton from "./AppointmentBookingFormSkeleton";

// Define schema for form validation
const AppointmentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select gender" }),
  }),
  age: z
    .string()
    .refine((val) => !isNaN(parseInt(val)), { message: "Age must be a number" })
    .refine((val) => parseInt(val) > 0 && parseInt(val) < 120, {
      message: "Age must be between 1 and 120",
    }),
  whatsapp: z
    .string()
    .regex(/^\d+$/, { message: "WhatsApp number must be numeric" })
    .min(10, { message: "Check the number" }),
  location: z.enum(["Financial District", "Kukatpally"], {
    errorMap: () => ({ message: "Please select a location" }),
  }),
  service: z.enum(
    [
      "Other",
      "Immunotherapy",
      "CAR T- Cells",
      "Half Matched Transplant BMT",
      "Allogeneic BMT",
      "Unrelated BMT",
      "Autologous BMT",
      "Erdheim Chester Disease",
      "VEXAS Syndrome",
      "Porphyrias",
      "Hemochromatosis",
      "LCH",
      "Hemophagocytic Syndrome (HLH)",
      "Storage Disorders",
      "Immunodeficiency",
      "IgG4-RD",
      "Platelets & WBC",
      "Unexplained high or low Hb",
      "ALPS",
      "Multiple Sclerosis",
      "Recurrent Abortions",
      "Recurrent Infections",
      "Bleeding and Clotting disorders",
      "DVT",
      "Sickle Cell Anemia",
      "Thalassemia",
      "ITP, TTP, FNAIT, AIHA, PNH",
      "Aplastic Anemia",
      "Pancytopenia",
      "MGUS",
      "Mastocytosis",
      "Myelofibrosis",
      "Blood Cancer",
      "MDS",
      "Myeloma",
      "Lymphoma",
      "Leukemia",
      "Bone Marrow Examination/Testing",
    ],
    {
      errorMap: () => ({ message: "Please select a service" }),
    }
  ),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time slot" }),
});

export interface BMTAppointmentFormData {
  name: string;
  email: string;
  gender: string;
  age: string;
  whatsapp: string;
  location: string;
  service: string;
  date: Date | null;
  time: string;
}
interface BookedAppointments {
  [key: string]: string[];
}

interface TimeSlot {
  time: string;
  ampm: string;
  label: string;
}

interface HematologybmtProps {
  blockedSlots?: { start: string; end: string }[];
}

const Hematologybmt = ({ blockedSlots = [] }: HematologybmtProps = {}) => {
  const [bookedAppointments, setBookedAppointments] =
    useState<BookedAppointments>({});
  const [isClient, setIsClient] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<Set<string>>(
    new Set()
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [lastPollTime, setLastPollTime] = useState(Date.now());
  const [countryCode, setCountryCode] = useState("+91");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const POLL_INTERVAL = 3000; // 3 seconds
  const [showAllBookedModal, setShowAllBookedModal] = useState(false);

  // Define steps
  const steps = [
    { id: 1, title: "Location", description: "Select clinic location" },
    { id: 2, title: "Service", description: "Select medical service" },
    { id: 3, title: "Personal Details", description: "Patient information" },
    { id: 4, title: "Appointment", description: "Date & time selection" },
    { id: 5, title: "Confirmation", description: "Review & submit" },
    { id: 6, title: "Success", description: "Appointment confirmed" },
  ];

  const totalSteps = steps.length;

  // Location and service configurations
  const locationOptions = [
    {
      name: "Financial District",
      hours: "12:00 pm to 3:00 pm",
    },
    {
      name: "Kukatpally",
      hours: "6:00 pm to 8:00 pm",
    },
  ];

  const locationTimeSlots: { [key: string]: string[] } = {
    "Financial District": [
      "12:00",
      "12:20",
      "12:40",
      "14:00",
      "14:20",
      "14:40",
      "15:00",
    ],
    Kukatpally: ["18:00", "18:20", "18:40", "19:00", "19:20", "19:40", "20:00"],
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BMTAppointmentFormData>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      name: "",
      email: "",
      gender: "",
      age: "",
      whatsapp: "",
      location: "",
      service: "",
      date: null,
      time: "",
    },
  });

  const watchLocation = watch("location");
  const watchDate = watch("date");
  const watchTime = watch("time");
  const watchService = watch("service");
  const watchGender = watch("gender");

  const genderOptions = [
    {
      value: "Male",
      label: "Male",
      icon: "👨",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      selectedBg: "bg-blue-100",
    },
    {
      value: "Female",
      label: "Female",
      icon: "👩",
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      selectedBg: "bg-pink-100",
    },
    {
      value: "Other",
      label: "Other",
      icon: "👤",
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      selectedBg: "bg-gray-100",
    },
  ];

  const getNamePlaceholder = () => {
    return "Your Full Name";
  };

  const getAgeLabel = () => {
    return "Your Age";
  };

  const getWhatsAppPlaceholder = () => {
    return "Your WhatsApp Number";
  };

  const getEmailPlaceholder = () => {
    return "Your Email Address";
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission only when explicitly requested
  const handleFormSubmit = async (data: BMTAppointmentFormData) => {
    if (currentStep !== 5) {
      return;
    }

    if (!data.date) return;

    try {
      setIsBooking(true);
      setCurrentStep(6); // Move to loading stage

      addPendingBooking(data.date, data.time);

      // Add country code to the phone number
      const dataWithPrefix = {
        ...data,
        whatsapp: countryCode + data.whatsapp,
      };

      // Add a minimum loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await SubmitHandlerBMT(dataWithPrefix);

      if (result?.success) {
        setSubmitted(true);
      } else {
        setPendingBookings((prev) => {
          const newSet = new Set(prev);
          newSet.delete(
            `${data.date?.toLocaleDateString("en-CA")}-${data.time}`
          );
          return newSet;
        });
        toast.error("Unable to book the slot. Please try again.");
        setCurrentStep(5); // Go back to confirmation step
      }

      const newSlots = await BookedSlots(1);
      if (newSlots) {
        const updatedAppointments = newSlots.reduce<BookedAppointments>(
          (acc, data) => {
            if (data.dateKey) {
              acc[data.dateKey] = [...(acc[data.dateKey] || []), data.time];
            }
            return acc;
          },
          {}
        );
        setBookedAppointments((prev) => ({ ...prev, ...updatedAppointments }));
      }
    } catch (err) {
      console.error("Error during form submission:", err);
      toast.error("Something went wrong. Please try again.");
      setCurrentStep(5); // Go back to confirmation step
    } finally {
      setIsBooking(false);
    }
  };

  // Handle explicit booking confirmation
  const confirmBooking = () => {
    handleSubmit(handleFormSubmit)();
  };

  // Prevent form submission on Enter key or other triggers when not on confirmation step
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 5) {
      handleSubmit(handleFormSubmit)();
    }
  };

  // Reset date and time when location changes
  useEffect(() => {
    setValue("date", null);
    setValue("time", "");
  }, [watchLocation, setValue]);

  // Dynamic time slots based on location

  const Services = [
    "ALPS",
    "Allogeneic BMT",
    "Aplastic Anemia",
    "Autologous BMT",
    "Bleeding and Clotting disorders",
    "Blood Cancer",
    "Bone Marrow Examination/Testing",
    "CAR T- Cells",
    "DVT",
    "Erdheim Chester Disease",
    "Half Matched Transplant BMT",
    "Hemochromatosis",
    "Hemophagocytic Syndrome (HLH)",
    "IgG4-RD",
    "Immunodeficiency",
    "Immunotherapy",
    "ITP, TTP, FNAIT, AIHA, PNH",
    "LCH",
    "Leukemia",
    "Lymphoma",
    "Mastocytosis",
    "MDS",
    "MGUS",
    "Multiple Sclerosis",
    "Myelofibrosis",
    "Myeloma",
    "Other",
    "Pancytopenia",
    "Platelets & WBC",
    "Porphyrias",
    "Recurrent Abortions",
    "Recurrent Infections",
    "Sickle Cell Anemia",
    "Storage Disorders",
    "Thalassemia",
    "Unexplained high or low Hb",
    "Unrelated BMT",
    "VEXAS Syndrome",
  ];

  const addPendingBooking = (date: Date, time: string) => {
    const dateKey = date.toLocaleDateString("en-CA");
    setPendingBookings((prev) => {
      const newSet = new Set(prev);
      newSet.add(`${dateKey}-${time}`);
      return newSet;
    });
  };

  // Enhanced polling function with debouncing
  useEffect(() => {
    const pollSlots = async () => {
      const now = Date.now();
      if (now - lastPollTime < POLL_INTERVAL) return;

      try {
        const newSlots = await BookedSlots(1);
        if (newSlots) {
          const updatedAppointments = newSlots.reduce(
            (acc: { [key: string]: string[] }, data) => {
              acc[data.dateKey] = [...(acc[data.dateKey] || []), data.time];
              return acc;
            },
            {}
          );

          setBookedAppointments((prev) => ({
            ...prev,
            ...updatedAppointments,
          }));
          setLastPollTime(now);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    const intervalId = setInterval(pollSlots, POLL_INTERVAL);
    setIsClient(true);
    return () => clearInterval(intervalId);
  }, [lastPollTime]);

  // Generate time slots based on location with blocking support
  const generateTimeSlots = (
    location: string | null,
    date: Date | null
  ): TimeSlot[] => {
    if (!location || !date || !locationTimeSlots[location]) {
      return [];
    }

    const selectedDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const timeSlots: TimeSlot[] = [];

    // Iterate through predefined time slots for the location
    for (const time of locationTimeSlots[location]) {
      const [hours, minutes] = time.split(":");
      const slotDate = new Date(selectedDate);
      slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Get the current time in the Asia/Kolkata timezone
      const now = new Date();
      const currentTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );

      // Skip past time slots for today
      if (
        selectedDate.toDateString() === currentTime.toDateString() &&
        slotDate < currentTime
      ) {
        continue;
      }

      // Check if the time slot falls within any blocked period
      const isBlocked = blockedSlots.some(({ start, end }) => {
        const slotTime = new Date(`2000-01-01T${time}`);
        const blockStart = new Date(`2000-01-01T${start}`);
        const blockEnd = new Date(`2000-01-01T${end}`);
        return slotTime >= blockStart && slotTime < blockEnd;
      });

      // Skip blocked time slots
      if (isBlocked) {
        continue;
      }

      // Format the time slot
      const formattedSlot: TimeSlot = {
        time,
        label: new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Kolkata",
        }).format(slotDate),
        ampm: new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }).format(slotDate),
      };

      timeSlots.push(formattedSlot);
    }

    return timeSlots;
  };

  const timeSlots = useMemo(() => {
    return generateTimeSlots(watchLocation, watchDate);
  }, [watchLocation, watchDate, blockedSlots]);

  // Check if all slots are unavailable when date or location changes
  useEffect(() => {
    if (watchLocation && watchDate) {
      const allUnavailable = areAllSlotsUnavailable(watchLocation, watchDate);
      if (allUnavailable && showTimeSlots) {
        setShowAllBookedModal(true);
        setShowTimeSlots(false);
      }
    }
  }, [
    watchLocation,
    watchDate,
    bookedAppointments,
    pendingBookings,
    blockedSlots,
    showTimeSlots,
  ]);

  const isSlotBooked = (date: Date, time: string): boolean => {
    if (!date) return false;
    const dateKey = date.toLocaleDateString("en-CA");
    const bookingKey = `${dateKey}-${time}`;

    return Boolean(
      bookedAppointments[dateKey]?.includes(time) ||
        pendingBookings.has(bookingKey)
    );
  };

  // Check if all slots are unavailable for a given location and date
  const areAllSlotsUnavailable = (
    location: string | null,
    date: Date | null
  ): boolean => {
    if (!location || !date || !locationTimeSlots[location]) {
      return false;
    }

    const selectedDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const now = new Date();
    const currentTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    let availableSlots = 0;

    // Check each time slot for the location
    for (const time of locationTimeSlots[location]) {
      const [hours, minutes] = time.split(":");
      const slotDate = new Date(selectedDate);
      slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Skip past time slots for today
      if (
        selectedDate.toDateString() === currentTime.toDateString() &&
        slotDate < currentTime
      ) {
        continue;
      }

      // Check if the time slot falls within any blocked period
      const isBlocked = blockedSlots.some(({ start, end }) => {
        const slotTime = new Date(`2000-01-01T${time}`);
        const blockStart = new Date(`2000-01-01T${start}`);
        const blockEnd = new Date(`2000-01-01T${end}`);
        return slotTime >= blockStart && slotTime < blockEnd;
      });

      // Skip blocked time slots
      if (isBlocked) {
        continue;
      }

      // Check if slot is booked
      if (!isSlotBooked(date, time)) {
        availableSlots++;
      }
    }

    return availableSlots === 0;
  };

  // Calendar generation function
  const generateCalendarDays = useMemo(() => {
    const indianTimezone = "Asia/Kolkata";
    const currentDateUTC = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];

    // Add null values for the days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add the actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateUTC = new Date(year, month, day);
      const dateIST = new Date(
        dateUTC.toLocaleString("en-US", { timeZone: indianTimezone })
      );
      const todayIST = new Date(
        currentDateUTC.toLocaleString("en-US", { timeZone: indianTimezone })
      );
      todayIST.setHours(0, 0, 0, 0);
      dateIST.setHours(0, 0, 0, 0);

      const isPastDate = dateIST.getTime() < todayIST.getTime();
      const isSunday = dateIST.getDay() === 0;
      const isThursday =
        watchLocation === "Kukatpally" && dateIST.getDay() === 4;

      days.push({
        day,
        date: dateIST,
        disabled: isPastDate || isSunday || isThursday,
      });
    }

    return days;
  }, [currentMonth, watchLocation]);

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "Select Date";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Validation for each step
  const validateStep = (step: number): boolean => {
    const values = watch();

    switch (step) {
      case 1:
        return Boolean(values.location);
      case 2:
        return Boolean(values.service);
      case 3:
        return Boolean(
          values.name &&
            values.gender &&
            values.age &&
            values.whatsapp &&
            values.email
        );
      case 4:
        return Boolean(values.date && values.time);
      case 5:
        return true; // Confirmation step is always valid if reached
      case 6:
        return true; // Success step is always valid
      default:
        return true;
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-blue-400 ">
        <AppointmentBookingFormSkeleton />
      </div>
    );
  }

  if (submitted) {
    const submittedData = watch();
    return (
      <div className="min-h-screen bg-[#C4E1E6] flex flex-col lg:flex-row items-center justify-center p-1 sm:p-2 gap-2 sm:gap-3">
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
          }
        `}</style>

        {/* Doctor Logo in Top Left Corner - Hidden on mobile */}
        <div className="hidden sm:block top-0 left-3 z-10">
          <Image
            src="/BmtLogo.png"
            alt="Dr.S.K.Gupta"
            width={200}
            height={100}
            className="rounded-lg object-cover w-full h-full"
          />
        </div>

        {/* Main Content Container */}
        <div className="min-h-screen flex items-center justify-center p-1 sm:p-2">
          <div className="bg-white shadow-xl rounded-xl p-3 sm:p-4 max-w-sm w-full mx-auto">
            {/* Mobile Logo - Show only on mobile */}
            <div className="block sm:hidden mb-3 text-center">
              <Image
                src="/BmtLogo.png"
                alt="Dr.S.K.Gupta"
                width={150}
                height={90}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>

            {/* Progress Indicator */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-3 px-1">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center relative min-w-0 flex-shrink">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 relative z-10 bg-green-600 text-white shadow-md">
                        ✓
                      </div>
                      {/* Step Label - Hidden on mobile and small screens, shown on larger screens */}
                      <div className="hidden md:block mt-1 text-center max-w-[50px]">
                        <div className="text-xs font-medium text-gray-700 leading-tight truncate">
                          {step.title}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 flex items-center px-1">
                        <div className="flex-1 h-0.5 transition-all duration-300 relative min-w-[6px] bg-green-600" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="text-center space-y-4 animate-fadeIn">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="text-green-500 w-10 h-10" />
              </div>

              <h3 className="text-lg font-bold text-green-800">
                Appointment Received!
              </h3>

              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-left">
                <h4 className="font-semibold text-gray-800 border-b pb-1.5 text-center">
                  Appointment Details
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">
                      {submittedData?.location || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">
                      {submittedData?.service || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient Name:</span>
                    <span className="font-medium">
                      {submittedData?.name || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">
                      {submittedData?.gender || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">
                      {submittedData?.age || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium">
                      {submittedData?.whatsapp || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">
                      {submittedData?.email || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {submittedData?.date
                        ? new Date(submittedData.date).toLocaleDateString(
                            "en-GB"
                          )
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {submittedData?.time
                        ? new Date(
                            `2000-01-01T${submittedData.time}`
                          ).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <div className="text-green-600 text-base">✅</div>
                  <div className="flex-1">
                    <p className="text-xs text-green-800 font-medium mb-1">
                      Acknowledgment Sent!
                    </p>
                    <p className="text-xs text-green-700">
                      📱 An acknowledgment message with all your appointment
                      details has been sent to your WhatsApp. Please stay tuned
                      in WhatsApp for more updates and reminders about your
                      appointment.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setCurrentStep(1);
                  reset();
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const TimeSlotButton: React.FC<{
    time: string;
    ampm: string;
    date: Date;
  }> = ({ time, ampm, date }) => (
    <button
      type="button"
      onClick={() => {
        setValue("time", time, { shouldValidate: true });
        setShowTimeSlots(false);
      }}
      disabled={isSlotBooked(date, time)}
      className={`
        text-xs sm:text-sm p-3 sm:p-4 rounded-lg border font-medium min-h-[50px] flex items-center justify-center
        ${
          isSlotBooked(date, time)
            ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
            : watchTime === time
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-green-700 border-green-200 hover:bg-green-50 active:bg-green-100"
        }
      `}
    >
      {ampm}
      {pendingBookings.has(`${date.toLocaleDateString("en-CA")}-${time}`) && (
        <span className="ml-1 animate-pulse">⏳</span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#C4E1E6] flex flex-col lg:flex-row items-center justify-center p-2 sm:p-4 gap-3 sm:gap-5">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="text-sm"
      />

      {/* Doctor Logo in Top Left Corner - Hidden on mobile */}
      <div className="hidden sm:block absolute top-0 left-5 z-10">
        <Image
          src="/BmtLogo.png"
          alt="Dr.S.K.Gupta"
          width={300}
          height={150}
          className="rounded-lg object-cover w-full h-full mt-4"
        />
      </div>

      {/* Sliding Calendar Panel */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center transition-all">
          <div className="w-full h-[85vh] sm:h-auto sm:w-80 sm:max-h-[80vh] bg-white rounded-t-2xl sm:rounded-2xl p-4 shadow-lg flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Select Date</h3>
              <button
                type="button"
                onClick={() => setShowCalendar(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(currentMonth.getMonth() - 1);
                  setCurrentMonth(newMonth);
                }}
                className="text-blue-600 hover:bg-blue-100 p-1 rounded-full"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-semibold">
                {currentMonth.toLocaleString("default", { month: "long" })}{" "}
                {currentMonth.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(currentMonth.getMonth() + 1);
                  setCurrentMonth(newMonth);
                }}
                className="text-blue-600 hover:bg-blue-100 p-1 rounded-full"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {["S", "M", "T", "W", "Th", "F", "St"].map((day) => (
                <div key={day} className="text-xs sm:text-sm font-medium py-2">
                  {day}
                </div>
              ))}

              {generateCalendarDays.map((dayObj, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (dayObj && !dayObj.disabled) {
                      setValue("date", dayObj.date, { shouldValidate: true });
                      setValue("time", "", { shouldValidate: true });
                      setShowCalendar(false);
                      setShowTimeSlots(true);
                    }
                  }}
                  disabled={dayObj === null || (dayObj && dayObj.disabled)}
                  className={`
                    text-xs sm:text-sm p-2 sm:p-3 rounded-full min-h-[40px] flex items-center justify-center
                    ${dayObj === null ? "invisible" : ""}
                    ${
                      dayObj && dayObj.disabled
                        ? "text-gray-300 cursor-not-allowed"
                        : ""
                    }
                    ${
                      watchDate &&
                      dayObj &&
                      watchDate.toDateString() === dayObj.date.toDateString()
                        ? "bg-blue-600 text-white"
                        : "hover:bg-blue-100 active:bg-blue-200"
                    }
                  `}
                >
                  {dayObj ? dayObj.day : ""}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sliding Time Slots Panel */}
      {showTimeSlots && timeSlots.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center transition-all">
          <div className="w-full h-[85vh] sm:h-auto sm:w-80 sm:max-h-[80vh] bg-white rounded-t-2xl sm:rounded-2xl p-4 shadow-lg flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Select Time</h3>
              <button
                type="button"
                onClick={() => setShowTimeSlots(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {watchDate ? formatDate(watchDate) : "Please select a date first"}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
              {timeSlots.map(({ time, ampm }) => (
                <TimeSlotButton
                  key={time}
                  time={time}
                  ampm={ampm}
                  date={watchDate!}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Booked Modal - Compact Mobile Friendly */}
      {showAllBookedModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center transition-all"
          onTouchStart={(e) => {
            const touch = e.touches[0];
            e.currentTarget.setAttribute(
              "data-start-x",
              touch.clientX.toString()
            );
          }}
          onTouchMove={(e) => {
            const startX = parseFloat(
              e.currentTarget.getAttribute("data-start-x") || "0"
            );
            const currentX = e.touches[0].clientX;
            const diff = currentX - startX;

            // Prevent default behavior on significant horizontal swipe
            if (Math.abs(diff) > 50) {
              e.preventDefault();
            }
          }}
          onTouchEnd={(e) => {
            const startX = parseFloat(
              e.currentTarget.getAttribute("data-start-x") || "0"
            );
            const endX = e.changedTouches[0].clientX;
            const diff = endX - startX;

            // Close modal on swipe right (positive X direction)
            if (diff > 100) {
              setShowAllBookedModal(false);
            }
          }}
        >
          <div className="w-full sm:max-w-sm mx-0 sm:mx-4 bg-white rounded-t-2xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl">
            {/* Mobile handle bar - Swipe Right Indicator */}
            <div className="block sm:hidden flex items-center justify-center mx-auto mb-2 space-x-1">
              <div className="w-2 h-1 bg-gray-300 rounded-full"></div>
              <div className="w-3 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-4 h-1 bg-gray-500 rounded-full"></div>
              <span className="text-gray-400 text-xs ml-1">→</span>
            </div>

            <div className="text-center space-y-2 sm:space-y-3">
              {/* Sad emoji with animation */}
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl sm:text-3xl animate-pulse">😔</span>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-red-800">
                All Appointments Booked
              </h3>

              {/* Message */}
              <div className="space-y-2 px-1">
                <p className="text-xs sm:text-sm text-gray-700 leading-tight">
                  Sorry, all appointments are booked for{" "}
                  <span className="font-semibold text-blue-600">
                    {watchLocation}
                  </span>{" "}
                  on{" "}
                  <span className="font-semibold text-blue-600">
                    {watchDate ? formatDate(watchDate) : "selected date"}
                  </span>
                </p>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-600 text-base flex-shrink-0">
                      🚨
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-orange-800">
                        For Emergency Cases - Connect with us directly
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Compact */}
              <div className="flex flex-col space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAllBookedModal(false);
                    setShowCalendar(true);
                  }}
                  className="w-full bg-blue-600 text-white px-3 py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium text-xs sm:text-sm touch-manipulation"
                >
                  📅 Select Different Date
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAllBookedModal(false);
                    setCurrentStep(1);
                    setValue("location", "");
                    setValue("date", null);
                    setValue("time", "");
                  }}
                  className="w-full bg-green-600 text-white px-3 py-2.5 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors font-medium text-xs sm:text-sm touch-manipulation"
                >
                  📍 Try Different Location
                </button>

                <button
                  type="button"
                  onClick={() => setShowAllBookedModal(false)}
                  className="w-full bg-gray-200 text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium text-xs sm:text-sm touch-manipulation"
                >
                  ✕ Close
                </button>
              </div>

              {/* Emergency Contact Info - Compact */}
              <div className="bg-gray-50 rounded-lg p-2 text-left">
                <h4 className="font-semibold text-gray-800 text-xs sm:text-sm mb-2 text-center">
                  📞 Emergency Contact
                </h4>
                <div className="space-y-1.5">
                  {/* Phone */}
                  <div className="flex items-center justify-between bg-white rounded p-2 border border-gray-200">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-blue-500 text-sm">📞</span>
                      <span className="text-xs text-gray-600">Phone:</span>
                    </div>
                    <a
                      href="tel:+917780297660"
                      className="font-semibold text-blue-600 text-xs hover:underline active:text-blue-800 touch-manipulation"
                    >
                      +91 7780297660
                    </a>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center justify-between bg-white rounded p-2 border border-gray-200">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-green-500 text-sm">💬</span>
                      <span className="text-xs text-gray-600">WhatsApp:</span>
                    </div>
                    <a
                      href="https://wa.me/7780297660"
                      className="font-semibold text-green-600 text-xs hover:underline active:text-green-800 touch-manipulation"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      +91 7780297660
                    </a>
                  </div>
                </div>
              </div>

              {/* Mobile close instruction */}
              <div className="block sm:hidden text-center">
                <p className="text-xs text-gray-400">Swipe right to close →</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white shadow-2xl rounded-2xl p-4 sm:p-6 max-w-md w-full mx-auto">
          {/* Mobile Logo - Show only on mobile */}
          <div className="block sm:hidden mb-4 text-center">
            <div className="mx-auto">
              <Image
                src="/BmtLogo.png"
                alt="Dr.S.K.Gupta"
                width={200}
                height={120}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4 px-1 sm:px-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center relative min-w-0 flex-shrink">
                    <div
                      className={`
                        w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 relative z-10
                        ${
                          currentStep >= step.id
                            ? "bg-blue-600 text-white shadow-lg"
                            : currentStep === step.id
                              ? "bg-blue-100 text-blue-600 border-2 border-blue-600 shadow-md"
                              : "bg-gray-200 text-gray-500"
                        }
                      `}
                    >
                      {currentStep > step.id ? "✓" : step.id}
                    </div>
                    {/* Step Label - Hidden on mobile and small screens, shown on larger screens */}
                    <div className="hidden md:block mt-1 text-center max-w-[60px]">
                      <div className="text-xs font-medium text-gray-700 leading-tight truncate">
                        {step.title}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 flex items-center px-1">
                      <div
                        className={`
                          flex-1 h-0.5 transition-all duration-300 relative min-w-[8px]
                          ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}
                        `}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-bold text-blue-800">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {steps[currentStep - 1].description}
              </p>
            </div>
          </div>

          <form onSubmit={onFormSubmit} className="space-y-6">
            {/* Step 1: Location Selection */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-3">
                      {locationOptions.map((location) => {
                        const isSelected = field.value === location.name;
                        return (
                          <button
                            key={location.name}
                            type="button"
                            onClick={() => field.onChange(location.name)}
                            className={`
                            p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left transform active:scale-[0.98] sm:hover:scale-[1.02]
                            ${
                              isSelected
                                ? "bg-blue-100 border-blue-200 border-opacity-100 shadow-md"
                                : "bg-blue-50 border-blue-200 border-opacity-50 hover:border-opacity-100 hover:shadow-sm"
                            }
                          `}
                          >
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="p-2 sm:p-3 rounded-lg bg-blue-50">
                                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm sm:text-base font-semibold text-gray-800">
                                  {location.name}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {location.hours}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500"></div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.location && (
                  <p className="text-red-500 text-xs text-center">
                    {errors.location.message}
                  </p>
                )}
              </div>
            )}

            {/* Step 2: Service Selection */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <Controller
                  name="service"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                      <select
                        {...field}
                        className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black appearance-none"
                      >
                        <option value="">Select Service</option>
                        {Services.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronRight className="h-5 w-5 text-gray-400 rotate-90" />
                      </div>
                      {errors.service && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.service.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            )}

            {/* Step 3: Personal Details */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Name Input */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                      <input
                        {...field}
                        type="text"
                        placeholder={getNamePlaceholder()}
                        className="w-full pl-10 pr-4 py-3 sm:py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black text-sm sm:text-base"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* Gender Selection */}
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">
                        Gender
                      </label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {genderOptions.map((option) => {
                          const isSelected = field.value === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => field.onChange(option.value)}
                              className={`
                              p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 text-center transform active:scale-[0.98] sm:hover:scale-[1.02]
                              ${
                                isSelected
                                  ? `${option.selectedBg} ${option.borderColor} border-opacity-100 shadow-md`
                                  : `${option.bgColor} ${option.borderColor} border-opacity-50 hover:border-opacity-100 hover:shadow-sm`
                              }
                            `}
                            >
                              <div className="text-xl sm:text-2xl mb-1">
                                {option.icon}
                              </div>
                              <div className="text-xs sm:text-sm font-medium text-gray-800">
                                {option.label}
                              </div>
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 mx-auto mt-1"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {errors.gender && (
                        <p className="text-red-500 text-xs mt-1 text-center">
                          {errors.gender.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* Age Input */}
                <Controller
                  name="age"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                      <input
                        {...field}
                        type="number"
                        placeholder={getAgeLabel()}
                        className="w-full pl-10 pr-4 py-3 sm:py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black text-sm sm:text-base"
                      />
                      {errors.age && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.age.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* WhatsApp Input */}
                <Controller
                  name="whatsapp"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <div className="flex items-center">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 z-10" />
                          <select
                            className="appearance-none pl-10 pr-6 py-3 bg-white border-2 border-r-0 border-green-200 rounded-l-lg text-gray-700 focus:outline-none focus:border-green-500 min-w-[90px] font-medium"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                          >
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                            <option value="+61">+61</option>
                            <option value="+971">+971</option>
                            <option value="+65">+65</option>
                            <option value="+60">+60</option>
                            <option value="+966">+966</option>
                            <option value="+974">+974</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                            <svg
                              className="fill-current h-4 w-4 text-gray-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                        <input
                          {...field}
                          type="tel"
                          placeholder={getWhatsAppPlaceholder()}
                          className="w-full py-3 px-4 border-2 border-green-200 rounded-r-lg focus:outline-none focus:border-green-500 transition-colors text-black"
                        />
                      </div>
                      {errors.whatsapp && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.whatsapp.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* Email Input */}
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                      <input
                        {...field}
                        type="email"
                        placeholder={getEmailPlaceholder()}
                        className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            )}

            {/* Step 4: Date and Time Selection */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCalendar(true);
                      setShowTimeSlots(false);
                    }}
                    className="flex items-center justify-between p-3 sm:p-3 border-2 rounded-lg hover:border-blue-300 active:border-blue-400 transition-all min-h-[50px]"
                  >
                    <div className="flex items-center">
                      <Calendar className="text-blue-500 w-4 h-4 mr-2" />
                      <span className="text-xs sm:text-sm font-medium">
                        {watchDate ? formatDate(watchDate) : "Select Date"}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (watchDate) {
                        const allUnavailable = areAllSlotsUnavailable(
                          watchLocation,
                          watchDate
                        );
                        if (allUnavailable) {
                          setShowAllBookedModal(true);
                        } else {
                          setShowTimeSlots(true);
                          setShowCalendar(false);
                        }
                      } else {
                        setShowCalendar(true);
                        toast.info("Please select a date first");
                      }
                    }}
                    className={`flex items-center justify-between p-3 sm:p-3 border-2 rounded-lg transition-all min-h-[50px] ${
                      !watchDate
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:border-blue-300 active:border-blue-400"
                    }`}
                    disabled={!watchDate}
                  >
                    <div className="flex items-center">
                      <Clock className="text-blue-500 w-4 h-4 mr-2" />
                      <span className="text-xs sm:text-sm font-medium">
                        {watchTime
                          ? new Date(
                              `2000-01-01T${watchTime}`
                            ).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "Select Time"}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                </div>

                {/* Error messages for date and time */}
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    {errors.date && (
                      <p className="text-red-500 text-xs">
                        {errors.date.message}
                      </p>
                    )}
                  </div>
                  <div className="w-1/2">
                    {errors.time && (
                      <p className="text-red-500 text-xs">
                        {errors.time.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-800 border-b pb-2">
                    Appointment Summary
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">
                        {watchLocation || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium">
                        {watchService || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Patient Name:</span>
                      <span className="font-medium">
                        {watch("name") || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">
                        {watchGender || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">
                        {watch("age") || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium">
                        {watch("whatsapp") || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">
                        {watch("email") || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {watchDate ? formatDate(watchDate) : "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {watchTime
                          ? new Date(
                              `2000-01-01T${watchTime}`
                            ).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Loading and Success */}
            {currentStep === 6 && !submitted && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center">
                  {/* WhatsApp Message Animation */}
                  <div className="relative mx-auto w-32 h-32 mb-6">
                    {/* Outer pulsing circles */}
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                    <div
                      className="absolute inset-2 bg-green-200 rounded-full animate-ping opacity-50"
                      style={{ animationDelay: "0.3s" }}
                    ></div>

                    {/* WhatsApp-style background */}
                    <div className="absolute inset-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      {/* Message bubble animation */}
                      <div className="relative">
                        <div className="text-white text-2xl animate-pulse">
                          💬
                        </div>
                        {/* Flying message bubbles */}
                        <div
                          className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="absolute -top-4 right-0 w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                        <div
                          className="absolute -top-6 right-2 w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.6s" }}
                        ></div>
                      </div>
                    </div>

                    {/* Phone icon */}
                    <div className="absolute top-0 right-0 w-6 h-6 text-green-600 animate-pulse">
                      📱
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    Sending WhatsApp Message
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Please wait while we send your appointment confirmation...
                  </p>

                  {/* Animated dots */}
                  <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-green-800 font-medium">
                      📋 Validating appointment details...
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 mt-3">
                    <div
                      className="w-4 h-4 bg-blue-600 rounded-full animate-pulse flex items-center justify-center"
                      style={{ animationDelay: "0.5s" }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-blue-800 font-medium">
                      🩺 Confirming with doctor...
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 mt-3">
                    <div
                      className="w-4 h-4 bg-green-600 rounded-full animate-pulse flex items-center justify-center"
                      style={{ animationDelay: "1s" }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-green-800 font-medium">
                      📱 Sending WhatsApp message...
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 mt-3">
                    <div
                      className="w-4 h-4 bg-purple-600 rounded-full animate-pulse flex items-center justify-center"
                      style={{ animationDelay: "1.5s" }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-purple-800 font-medium">
                      ✅ Finalizing confirmation...
                    </span>
                  </div>
                </div>

                {/* WhatsApp branding hint */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
                    <span>💬</span>
                    <span>Message will be sent via WhatsApp</span>
                    <span>📱</span>
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep !== 6 && (
              <div className="flex justify-between pt-4 gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`
                  px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base min-h-[44px] flex-1 sm:flex-none
                  ${
                    currentStep === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400"
                  }
                `}
                >
                  Previous
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className={`
                    px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base min-h-[44px] flex-1 sm:flex-none
                    ${
                      !validateStep(currentStep)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                    }
                  `}
                  >
                    Next
                  </button>
                ) : currentStep === 5 ? (
                  <button
                    type="button"
                    onClick={confirmBooking}
                    disabled={isBooking || !watchDate || !watchTime}
                    className={`
                    px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base min-h-[44px] flex-1 sm:flex-none
                    ${
                      isBooking || !watchDate || !watchTime
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
                    }
                  `}
                  >
                    {isBooking ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⏳</span>
                        <span className="hidden sm:inline">Booking...</span>
                        <span className="sm:hidden">...</span>
                      </span>
                    ) : (
                      <>
                        <span className="hidden sm:inline">
                          Confirm Booking
                        </span>
                        <span className="sm:hidden">Confirm</span>
                      </>
                    )}
                  </button>
                ) : null}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Hematologybmt;
export type { HematologybmtProps };
