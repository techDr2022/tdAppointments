"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
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
  Cake,
  Calendar,
  Clock,
  X,
  Users,
  UserCheck,
} from "lucide-react";
import { BookedSlots } from "@/actions/BookSlots";
import Image from "next/image";
import { SubmitHandlerAll } from "@/actions/SubmitHandlers";

// Define schema for form validation
const AppointmentSchema = z
  .object({
    bookingType: z.enum(["myself", "others"], {
      required_error: "Please select who this appointment is for",
    }),
    relationship: z.string().optional(),
    appointmentType: z.enum(
      ["initial", "followup", "secondopinion", "others"],
      {
        required_error: "Please select the type of appointment",
      }
    ),
    customAppointmentType: z.string().optional(),
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    gender: z.enum(["male", "female", "other"], {
      required_error: "Please select gender",
    }),
    age: z
      .string()
      .refine((val) => !isNaN(parseInt(val)), {
        message: "Age must be a number",
      })
      .refine((val) => parseInt(val) > 0 && parseInt(val) < 120, {
        message: "Age must be between 1 and 120",
      }),
    whatsapp: z
      .string()
      .regex(/^\d+$/, { message: "WhatsApp number must be numeric" })
      .min(10, { message: "Check the number" }),
    date: z.date({ required_error: "Please select a date" }),
    time: z.string({ required_error: "Please select a time slot" }),
    location: z.string().optional(),
    doctorId: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.appointmentType === "others") {
        return (
          data.customAppointmentType &&
          data.customAppointmentType.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Please specify the appointment type",
      path: ["customAppointmentType"],
    }
  );

export interface AllAppointmentFormData {
  bookingType: "myself" | "others";
  relationship?: string;
  appointmentType: "initial" | "followup" | "secondopinion" | "others";
  customAppointmentType?: string;
  name: string;
  gender: "male" | "female" | "other";
  age: string;
  whatsapp: string;
  date: Date | null;
  time: string;
  reason?: string;
  location?: string;
  doctorId?: number;
}

interface BookedAppointments {
  [date: string]: string[];
}

interface TimeSlot {
  time: string;
  label: string;
  ampm: string;
}

interface Location {
  name: string;
  doctors: {
    name: string;
    id: number;
  }[];
}

interface DrFormsProps {
  doctorid: number;
  imageSrc: string;
  starting: string;
  ending: string;
  blockedSlots?: { start: string; end: string }[];
  locations?: Location[];
}

const DrForms = ({
  doctorid,
  imageSrc,
  starting,
  ending,
  blockedSlots = [],
  locations = [],
}: DrFormsProps) => {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<number>(doctorid);
  const [bookedAppointments, setBookedAppointments] = useState<{
    [date: string]: string[];
  }>({});
  const [submitted, setSubmitted] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pendingBookings, setPendingBookings] = useState<Set<string>>(
    new Set()
  );
  const [lastPollTime, setLastPollTime] = useState(Date.now());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const POLL_INTERVAL = 10000; // 10 seconds

  // Define steps
  const steps = [
    { id: 1, title: "Booking Type", description: "Who is this for?" },
    { id: 2, title: "Appointment Type", description: "Type of consultation" },
    { id: 3, title: "Personal Details", description: "Patient information" },
    { id: 4, title: "Appointment", description: "Date & time selection" },
    { id: 5, title: "Confirmation", description: "Review & submit" },
    { id: 6, title: "Success", description: "Appointment confirmed" },
  ];

  const totalSteps = steps.length;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AllAppointmentFormData>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      bookingType: "myself",
      relationship: "",
      appointmentType: "initial",
      customAppointmentType: "",
      name: "",
      gender: "male",
      age: "",
      whatsapp: "",
      date: null,
      time: "",
    },
  });

  const watchDate = watch("date");
  const watchTime = watch("time");
  const watchBookingType = watch("bookingType");
  const watchAppointmentType = watch("appointmentType");
  const watchGender = watch("gender");

  const bookingOptions = [
    {
      value: "myself",
      label: "For Myself",
      description: "Book an appointment for yourself",
      icon: UserCheck,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      selectedBg: "bg-blue-100",
    },
    {
      value: "others",
      label: "For Others",
      description: "Book for family member or friend",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      selectedBg: "bg-green-100",
    },
  ];

  const appointmentTypeOptions = [
    {
      value: "initial",
      label: "Initial Consultation",
      description: "First-time visit for new concerns",
      icon: "🩺",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      selectedBg: "bg-blue-100",
    },
    {
      value: "followup",
      label: "Follow-up Consultation",
      description: "Continuing care for ongoing treatment",
      icon: "🔄",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      selectedBg: "bg-green-100",
    },
    {
      value: "secondopinion",
      label: "Second Opinion",
      description: "Seeking additional medical perspective",
      icon: "💭",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      selectedBg: "bg-purple-100",
    },
    {
      value: "others",
      label: "Others",
      description: "Specify your specific consultation need",
      icon: "📝",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      selectedBg: "bg-orange-100",
    },
  ];

  const genderOptions = [
    {
      value: "male",
      label: "Male",
      icon: "👨",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      selectedBg: "bg-blue-100",
    },
    {
      value: "female",
      label: "Female",
      icon: "👩",
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      selectedBg: "bg-pink-100",
    },
    {
      value: "other",
      label: "Other",
      icon: "👤",
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      selectedBg: "bg-gray-100",
    },
  ];

  const getNamePlaceholder = () => {
    switch (watchBookingType) {
      case "myself":
        return "Your Full Name";
      case "others":
        return "Patient's Full Name";
      default:
        return "Full Name";
    }
  };

  const getAgeLabel = () => {
    switch (watchBookingType) {
      case "myself":
        return "Your Age";
      case "others":
        return "Patient's Age";
      default:
        return "Age";
    }
  };

  const getWhatsAppPlaceholder = () => {
    switch (watchBookingType) {
      case "myself":
        return "Your WhatsApp Number";
      case "others":
        return "Contact WhatsApp Number";
      default:
        return "WhatsApp Number";
    }
  };

  const addPendingBooking = (date: Date, time: string) => {
    const dateKey = date.toLocaleDateString("en-CA");
    setPendingBookings((prev) => {
      const newSet = new Set(prev);
      newSet.add(`${dateKey}-${time}`);
      return newSet;
    });
  };

  const generateTimeSlots = (date: Date | null): TimeSlot[] => {
    if (!date) {
      return [];
    }

    // Convert the provided date to the Asia/Kolkata timezone
    const selectedDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    // Parse the starting and ending times
    const [startHour, startMinute] = starting.split(":").map(Number);
    const [endHour, endMinute] = ending.split(":").map(Number);

    // Generate an array of time slots
    const timeSlots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      for (
        let minute = hour === startHour ? startMinute : 0;
        minute < 60;
        minute += 30
      ) {
        // Stop generating slots beyond the end hour and minute
        if (hour === endHour && minute > endMinute) break;

        const slotDate = new Date(selectedDate);
        slotDate.setHours(hour, minute, 0, 0);

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

        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

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
        const formattedSlot = {
          time: time,
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
    }

    return timeSlots;
  };

  const timeSlots = useMemo(() => {
    return generateTimeSlots(watchDate);
  }, [watchDate]);

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

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Handle form submission only when explicitly requested
  const handleFormSubmit = async (data: AllAppointmentFormData) => {
    if (currentStep !== 5) {
      // Prevent submission if not on confirmation step
      return;
    }

    if (!data.date) return;

    // Validate location and doctor selection if locations are provided
    if (locations.length > 0) {
      if (!selectedLocation) {
        toast.error("Please select a location");
        return;
      }
      if (!selectedDoctor) {
        toast.error("Please select a doctor");
        return;
      }
    }

    try {
      setIsBooking(true);
      setCurrentStep(6); // Move to loading stage

      addPendingBooking(data.date, data.time);

      // Use the selected doctor ID if locations are provided, otherwise use the default doctorid
      const doctorIdToUse = locations.length > 0 ? selectedDoctor : doctorid;

      const result = await SubmitHandlerAll(
        { ...data, location: selectedLocation, doctorId: doctorIdToUse },
        "FORM",
        doctorIdToUse
      );

      // Add a minimum loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 2000));

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

      // Refresh booked slots after submission
      const newSlots = await BookedSlots(doctorIdToUse);
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

  // Calendar generation function
  const generateCalendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];

    // Add null values for the days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Create a Date object for today with the time set to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add the actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison

      // Check if the current date is in the past or is a Sunday
      const isPastDate = date.getTime() < today.getTime(); // Use getTime() for accurate comparison
      const isSunday = date.getDay() === 0;

      days.push({ day, date, disabled: isPastDate || isSunday });
    }

    return days;
  }, [currentMonth]);

  const isSlotBooked = (date: Date | null, time: string) => {
    if (!date) return false;
    const dateKey = date.toLocaleDateString("en-CA");
    const bookingKey = `${dateKey}-${time}`;

    return Boolean(
      bookedAppointments[dateKey]?.includes(time) ||
        pendingBookings.has(bookingKey)
    );
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "Select Date";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const pollSlots = async () => {
      const now = Date.now();
      if (now - lastPollTime < POLL_INTERVAL) return;

      try {
        // Use the selected doctor ID if locations are provided, otherwise use the default doctorid
        const doctorIdToUse = locations.length > 0 ? selectedDoctor : doctorid;
        const slotKeys = await BookedSlots(doctorIdToUse);

        if (slotKeys && slotKeys.length > 0) {
          const updatedAppointments: BookedAppointments = slotKeys.reduce(
            (acc, data) => {
              acc[data.dateKey] = [...(acc[data.dateKey] || []), data.time];
              return acc;
            },
            {} as BookedAppointments
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

    return () => {
      clearInterval(intervalId);
    };
  }, [doctorid, lastPollTime, locations.length, selectedDoctor]);

  // Validation for each step
  const validateStep = (step: number): boolean => {
    const values = watch();

    switch (step) {
      case 1:
        return Boolean(
          values.bookingType &&
            (values.bookingType !== "others" || values.relationship)
        );
      case 2:
        return Boolean(
          values.appointmentType &&
            (values.appointmentType !== "others" ||
              values.customAppointmentType)
        );
      case 3:
        return Boolean(
          values.name &&
            values.gender &&
            values.age &&
            values.whatsapp &&
            (locations.length === 0 || (selectedLocation && selectedDoctor))
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
            src={imageSrc}
            alt="Doctor logo"
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
                src={imageSrc}
                alt="Doctor logo"
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
                    <span className="text-gray-600">Booking Type:</span>
                    <span className="font-medium">
                      {submittedData?.bookingType === "myself" && "For Myself"}
                      {submittedData?.bookingType === "others" &&
                        `For Others${submittedData?.relationship ? ` (${submittedData.relationship})` : ""}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Appointment Type:</span>
                    <span className="font-medium">
                      {submittedData?.appointmentType === "initial" &&
                        "Initial Consultation"}
                      {submittedData?.appointmentType === "followup" &&
                        "Follow-up Consultation"}
                      {submittedData?.appointmentType === "secondopinion" &&
                        "Second Opinion"}
                      {submittedData?.appointmentType === "others" &&
                        (submittedData?.customAppointmentType || "Other")}
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
                      {submittedData?.gender === "male" && "Male"}
                      {submittedData?.gender === "female" && "Female"}
                      {submittedData?.gender === "other" && "Other"}
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

      {/* Doctor Logo in Top Left Corner - Hidden on mobile */}
      <div className="hidden sm:block absolute top-0 left-5 z-10">
        <Image
          src={imageSrc}
          alt="Doctor logo"
          width={300}
          height={150}
          className="rounded-lg object-cover w-full h-full mt-4"
        />
      </div>

      {/* Main Content Container */}
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
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
                  <div
                    key={day}
                    className="text-xs sm:text-sm font-medium py-2"
                  >
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
                {watchDate
                  ? formatDate(watchDate)
                  : "Please select a date first"}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                {timeSlots.map(({ time, ampm }) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      setValue("time", time, { shouldValidate: true });
                      setShowTimeSlots(false);
                    }}
                    disabled={isSlotBooked(watchDate, time)}
                    className={`text-xs sm:text-sm p-3 sm:p-4 rounded-lg border font-medium min-h-[50px] flex items-center justify-center
                    ${
                      isSlotBooked(watchDate, time)
                        ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
                        : watch("time") === time
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-green-700 border-green-200 hover:bg-green-50 active:bg-green-100"
                    }`}
                  >
                    {ampm}
                    {pendingBookings.has(
                      `${watchDate?.toLocaleDateString("en-CA")}-${time}`
                    ) && <span className="ml-1 animate-pulse">⏳</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-2xl rounded-2xl p-4 sm:p-6 max-w-md w-full mx-auto">
          {/* Mobile Logo - Show only on mobile */}
          <div className="block sm:hidden mb-4 text-center">
            <div className="mx-auto">
              <Image
                src={imageSrc}
                alt="Doctor logo"
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
            {/* Step 1: Booking Type Selection */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <Controller
                  name="bookingType"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-3">
                      {bookingOptions.map((option) => {
                        const IconComponent = option.icon;
                        const isSelected = field.value === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              field.onChange(option.value);
                              if (option.value !== "others") {
                                setValue("relationship", "");
                              }
                            }}
                            className={`
                            p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left transform active:scale-[0.98] sm:hover:scale-[1.02]
                            ${
                              isSelected
                                ? `${option.selectedBg} ${option.borderColor} border-opacity-100 shadow-md`
                                : `${option.bgColor} ${option.borderColor} border-opacity-50 hover:border-opacity-100 hover:shadow-sm`
                            }
                          `}
                          >
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div
                                className={`p-2 sm:p-3 rounded-lg ${option.bgColor}`}
                              >
                                <IconComponent
                                  className={`w-5 h-5 sm:w-6 sm:h-6 ${option.color}`}
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm sm:text-base font-semibold text-gray-800">
                                  {option.label}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {option.description}
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
                {errors.bookingType && (
                  <p className="text-red-500 text-xs text-center">
                    {errors.bookingType.message}
                  </p>
                )}

                {/* Relationship Field for "Others" - Now in Step 1 */}
                {watchBookingType === "others" && (
                  <div className="mt-4 animate-fadeIn">
                    <Controller
                      name="relationship"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                          <input
                            {...field}
                            type="text"
                            placeholder="Relationship (e.g., Father, Mother, Friend)"
                            className="w-full pl-10 pr-4 py-3 sm:py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-black text-sm sm:text-base"
                          />
                          {errors.relationship && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.relationship.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Appointment Type Selection */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <Controller
                  name="appointmentType"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-3">
                      {appointmentTypeOptions.map((option) => {
                        const isSelected = field.value === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              field.onChange(option.value);
                              if (option.value !== "others") {
                                setValue("customAppointmentType", "");
                              }
                            }}
                            className={`
                            p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left transform active:scale-[0.98] sm:hover:scale-[1.02]
                            ${
                              isSelected
                                ? `${option.selectedBg} ${option.borderColor} border-opacity-100 shadow-md`
                                : `${option.bgColor} ${option.borderColor} border-opacity-50 hover:border-opacity-100 hover:shadow-sm`
                            }
                          `}
                          >
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div
                                className={`p-2 sm:p-3 rounded-lg ${option.bgColor} text-xl sm:text-2xl`}
                              >
                                {option.icon}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm sm:text-base font-semibold text-gray-800">
                                  {option.label}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {option.description}
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
                {errors.appointmentType && (
                  <p className="text-red-500 text-xs text-center">
                    {errors.appointmentType.message}
                  </p>
                )}

                {/* Custom Appointment Type Field for "Others" */}
                {watchAppointmentType === "others" && (
                  <div className="mt-4 animate-fadeIn">
                    <Controller
                      name="customAppointmentType"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 text-lg">
                            📝
                          </div>
                          <input
                            {...field}
                            type="text"
                            placeholder="Please specify the type of appointment"
                            className="w-full pl-10 pr-4 py-3 sm:py-3 border-2 border-orange-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors text-black text-sm sm:text-base"
                          />
                          {errors.customAppointmentType && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.customAppointmentType.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Personal Details */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Location Selection */}
                {locations.length > 0 && (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <select
                      value={selectedLocation}
                      onChange={(e) => {
                        setSelectedLocation(e.target.value);
                        setSelectedDoctor(0);
                      }}
                      className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black appearance-none"
                    >
                      <option value="">Select Location</option>
                      {locations.map((location) => (
                        <option key={location.name} value={location.name}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronRight className="h-5 w-5 text-gray-400 rotate-90" />
                    </div>
                  </div>
                )}

                {/* Doctor Selection */}
                {locations.length > 0 && selectedLocation && (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                    </div>
                    <select
                      value={selectedDoctor}
                      onChange={(e) =>
                        setSelectedDoctor(Number(e.target.value))
                      }
                      className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black appearance-none"
                    >
                      <option value="">Select Doctor</option>
                      {locations
                        .find((loc) => loc.name === selectedLocation)
                        ?.doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronRight className="h-5 w-5 text-gray-400 rotate-90" />
                    </div>
                  </div>
                )}

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
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                      <input
                        {...field}
                        type="tel"
                        placeholder={getWhatsAppPlaceholder()}
                        className="w-full pl-10 pr-4 py-3 sm:py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-black text-sm sm:text-base"
                      />
                      {errors.whatsapp && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.whatsapp.message}
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
                        setShowTimeSlots(true);
                        setShowCalendar(false);
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
                      <span className="text-gray-600">Booking Type:</span>
                      <span className="font-medium">
                        {watchBookingType === "myself" && "For Myself"}
                        {watchBookingType === "others" &&
                          `For Others${watch("relationship") ? ` (${watch("relationship")})` : ""}`}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Appointment Type:</span>
                      <span className="font-medium">
                        {watchAppointmentType === "initial" &&
                          "Initial Consultation"}
                        {watchAppointmentType === "followup" &&
                          "Follow-up Consultation"}
                        {watchAppointmentType === "secondopinion" &&
                          "Second Opinion"}
                        {watchAppointmentType === "others" &&
                          (watch("customAppointmentType") || "Other")}
                      </span>
                    </div>

                    {selectedLocation && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{selectedLocation}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Patient Name:</span>
                      <span className="font-medium">
                        {watch("name") || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">
                        {watchGender === "male" && "Male"}
                        {watchGender === "female" && "Female"}
                        {watchGender === "other" && "Other"}
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
                    disabled={
                      isBooking ||
                      !watchDate ||
                      !watchTime ||
                      (locations.length > 0 &&
                        (!selectedLocation || !selectedDoctor))
                    }
                    className={`
                    px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base min-h-[44px] flex-1 sm:flex-none
                    ${
                      isBooking ||
                      !watchDate ||
                      !watchTime ||
                      (locations.length > 0 &&
                        (!selectedLocation || !selectedDoctor))
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

export default DrForms;
