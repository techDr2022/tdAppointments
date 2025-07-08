"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useForm, Controller, UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";
import {
  Heart,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  Cake,
  FileText,
  Calendar,
  Clock,
  X,
  Users,
  UserCheck,
} from "lucide-react";
import { BookedSlots } from "@/actions/BookSlots";
import Image from "next/image";
import { SubmitHandlerAll } from "@/actions/SubmitHandlers";

// Schema definition
const AppointmentSchema = z.object({
  bookingType: z.enum(["myself", "others"], {
    required_error: "Please select who this appointment is for",
  }),
  relationship: z.string().optional(),
  doctorId: z.number({
    required_error: "Please select a doctor",
  }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
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
  date: z.date({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time slot" }),
  reason: z.string().optional(),
});

// Interfaces
interface ClinicAppointmentFormData {
  bookingType: "myself" | "others";
  relationship?: string;
  doctorId: number;
  name: string;
  age: string;
  whatsapp: string;
  date: Date | null;
  time: string;
  reason?: string;
}

// Update the component props interface
interface TimesSlotsPickerProps {
  timeSlots: Array<{ time: string; ampm: string }>;
  watchDate: Date | null;
  watchTime: string;
  isSlotBooked: (date: Date | null, time: string) => boolean;
  setValue: UseFormSetValue<ClinicAppointmentFormData>;
  setShowTimeSlots: (show: boolean) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}
interface BookedAppointments {
  [date: string]: string[];
}

interface Doctor {
  id: number;
  name: string;
  imageSrc: string;
  startTime: string;
  endTime: string;
}

interface Clinic {
  id: number;
  doctors: Doctor[];
}

const clinics: Clinic[] = [
  {
    id: 1,
    doctors: [
      {
        id: 20,
        name: "Dr M Raga Sirisha",
        imageSrc: "/raga-logo.png",
        startTime: "09:00",
        endTime: "21:00",
      },
      {
        id: 27,
        name: "Dr. T Rajashekar Reddy",
        imageSrc: "/raga-logo.png",
        startTime: "9:00",
        endTime: "21:00",
      },
    ],
  },
  {
    id: 4,
    doctors: [
      {
        id: 46,
        name: "Dr Pranavi Reddy",
        imageSrc: "/neumed-logo.jpg",
        startTime: "09:00",
        endTime: "21:00",
      },
      {
        id: 35,
        name: "Dr.E.DHEEMANTH REDDY",
        imageSrc: "/neumed-logo.jpg",
        startTime: "9:00",
        endTime: "21:00",
      },
    ],
  },
];

// Custom hook for handling booked slots
const useBookedSlots = (selectedDoctorId: number) => {
  const [bookedAppointments, setBookedAppointments] =
    useState<BookedAppointments>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookedSlots = async () => {
    if (!selectedDoctorId) {
      setBookedAppointments({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const slotKeys = await BookedSlots(selectedDoctorId);

      if (slotKeys && Array.isArray(slotKeys) && slotKeys.length > 0) {
        const updatedAppointments = slotKeys.reduce((acc, data) => {
          if (data.dateKey && data.time) {
            acc[data.dateKey] = [...(acc[data.dateKey] || []), data.time];
          }
          return acc;
        }, {} as BookedAppointments);

        setBookedAppointments(updatedAppointments);
      } else {
        setBookedAppointments({});
      }
    } catch (err) {
      console.error("Error fetching booked slots:", err);
      setError("Failed to load available time slots. Please try again.");
      toast.error("Error loading time slots");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookedSlots();

    const intervalId = setInterval(fetchBookedSlots, 10000);
    return () => clearInterval(intervalId);
  }, [selectedDoctorId]);

  return {
    bookedAppointments,
    isLoading,
    error,
    refetch: fetchBookedSlots,
  };
};

// TimeSlotsPicker Component
const TimeSlotsPicker: React.FC<TimesSlotsPickerProps> = ({
  timeSlots,
  watchDate,
  watchTime,
  isSlotBooked,
  setValue,
  setShowTimeSlots,
  isLoading,
  error,
  onRetry,
}) => {
  // Rest of your component code remains the same
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading available slots...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry Loading Slots
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {timeSlots.map(({ time, ampm }) => (
        <button
          key={time}
          type="button"
          onClick={() => {
            setValue("time", time, { shouldValidate: true });
            setShowTimeSlots(false);
          }}
          disabled={isSlotBooked(watchDate, time)}
          className={`
            text-sm p-3 rounded-lg border font-medium
            ${
              isSlotBooked(watchDate, time)
                ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
                : watchTime === time
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-green-700 border-green-200 hover:bg-green-50"
            }
          `}
        >
          {ampm}
          {isSlotBooked(watchDate, time) && (
            <span className="block text-xs">Booked</span>
          )}
        </button>
      ))}
    </div>
  );
};

// Main ClinicDrForms Component
const ClinicDrForms = ({ clinicId }: { clinicId: number }) => {
  const [submitted, setSubmitted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Define steps
  const steps = [
    { id: 1, title: "Booking Type", description: "Who is this for?" },
    { id: 2, title: "Doctor Selection", description: "Choose your doctor" },
    { id: 3, title: "Personal Details", description: "Patient information" },
    { id: 4, title: "Appointment", description: "Date & time selection" },
    { id: 5, title: "Confirmation", description: "Review & submit" },
  ];

  const totalSteps = steps.length;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClinicAppointmentFormData>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      bookingType: "myself",
      relationship: "",
      doctorId: 0,
      name: "",
      age: "",
      whatsapp: "",
      date: null,
      time: "",
      reason: "",
    },
  });

  const watchDate = watch("date");
  const watchTime = watch("time");
  const selectedDoctorId = watch("doctorId");
  const watchBookingType = watch("bookingType");

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
        return Boolean(values.doctorId);
      case 3:
        return Boolean(values.name && values.age && values.whatsapp);
      case 4:
        return Boolean(values.date && values.time);
      default:
        return true;
    }
  };

  // Handle form submission only when explicitly requested
  const handleFormSubmit = async (data: ClinicAppointmentFormData) => {
    if (currentStep !== totalSteps) {
      return;
    }

    try {
      const result = await SubmitHandlerAll(data, "FORM", data.doctorId);
      if (result?.success) {
        setSubmitted(true);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } catch (err) {
      console.error("Error during form submission:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Handle explicit booking confirmation
  const confirmBooking = () => {
    handleSubmit(handleFormSubmit)();
  };

  // Prevent form submission on Enter key or other triggers when not on final step
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === totalSteps) {
      handleSubmit(handleFormSubmit)();
    }
  };

  const doctors =
    clinics.find((clinic) => clinic.id === clinicId)?.doctors || [];
  const selectedDoctor = doctors.find((doc) => doc.id === selectedDoctorId);

  const {
    bookedAppointments,
    isLoading: slotsLoading,
    error: slotsError,
    refetch: refetchSlots,
  } = useBookedSlots(selectedDoctorId);

  // Calendar generation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);

      const isPastDate = date.getTime() < today.getTime();
      const isSunday = date.getDay() === 0;

      days.push({ day, date, disabled: isPastDate || isSunday });
    }

    return days;
  }, [currentMonth]);

  // Time slots generation
  const generateTimeSlots = (
    date: Date | null,
    startTime: string,
    endTime: string
  ) => {
    if (!date || !startTime || !endTime) return [];

    const selectedDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const timeSlots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      for (
        let minute = hour === startHour ? startMinute : 0;
        minute < 60;
        minute += 30
      ) {
        if (hour === endHour && minute > endMinute) break;

        const slotDate = new Date(selectedDate);
        slotDate.setHours(hour, minute, 0, 0);

        const now = new Date();
        const currentTime = new Date(
          now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );

        if (
          selectedDate.toDateString() === currentTime.toDateString() &&
          slotDate < currentTime
        ) {
          continue;
        }

        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const ampm = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }).format(slotDate);

        timeSlots.push({ time, ampm });
      }
    }

    return timeSlots;
  };

  const timeSlots = useMemo(() => {
    if (!selectedDoctor || !watchDate) return [];
    return generateTimeSlots(
      watchDate,
      selectedDoctor.startTime,
      selectedDoctor.endTime
    );
  }, [watchDate, selectedDoctor]);

  const isSlotBooked = (date: Date | null, time: string) => {
    if (!date) return false;
    const dateKey = new Date(date).toLocaleDateString("en-CA");
    return bookedAppointments[dateKey]?.includes(time) || false;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Select Date";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDoctorChange = (doctorId: number) => {
    setValue("doctorId", doctorId);
    setValue("date", null);
    setValue("time", "");
    setShowCalendar(false);
    setShowTimeSlots(false);
  };

  if (submitted) {
    const submittedData = watch();
    const doctorName =
      doctors.find((d) => d.id === submittedData.doctorId)?.name || "Doctor";

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-200 to-blue-400 flex flex-col md:flex-row md:items-center md:justify-center z-50 p-4 gap-4">
        <div className="hidden md:block">
          {selectedDoctor && (
            <Image
              src={selectedDoctor.imageSrc}
              alt="Doctor"
              width={400}
              height={300}
              className="rounded-lg shadow-lg"
            />
          )}
        </div>

        <div className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-sm w-full">
          <Heart className="mx-auto text-green-500 w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold text-blue-800 mb-4">
            Appointment Confirmed!
          </h2>
          <div className="space-y-2 text-gray-700 mb-6">
            <p>
              <span className="font-semibold">Booking Type:</span>{" "}
              {submittedData?.bookingType === "myself" && "For Myself"}
              {submittedData?.bookingType === "others" &&
                `For Others${submittedData?.relationship ? ` (${submittedData.relationship})` : ""}`}
            </p>
            <p>
              <span className="font-semibold">Doctor:</span> {doctorName}
            </p>
            <p>
              <span className="font-semibold">Name:</span>{" "}
              {submittedData?.name || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Date:</span>{" "}
              {submittedData?.date
                ? new Date(submittedData.date).toLocaleDateString("en-GB")
                : "N/A"}
            </p>
            <p>
              <span className="font-semibold">Time:</span>{" "}
              {submittedData?.time || "N/A"}
            </p>
            {submittedData?.reason && (
              <p>
                <span className="font-semibold">Reason:</span>{" "}
                {submittedData.reason}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              setSubmitted(false);
              reset();
            }}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center justify-center p-4">
      <ToastContainer />

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex md:items-center md:justify-center transition-all">
          <div className="absolute right-0 top-0 h-full w-full md:w-80 bg-white p-4 shadow-lg flex flex-col overflow-y-auto">
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
                <div key={day} className="text-xs font-medium py-2">
                  {day}
                </div>
              ))}

              {calendarDays.map((dayObj, index) => (
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
                    text-sm p-2 rounded-full
                    ${dayObj === null ? "invisible" : ""}
                    ${dayObj && dayObj.disabled ? "text-gray-300 cursor-not-allowed" : ""}
                    ${
                      watchDate &&
                      dayObj &&
                      watchDate.toDateString() === dayObj.date.toDateString()
                        ? "bg-blue-600 text-white"
                        : "hover:bg-blue-100"
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

      {/* Time Slots Modal */}
      {showTimeSlots && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex md:items-center md:justify-center transition-all">
          <div className="absolute right-0 top-0 h-full w-full md:w-80 bg-white p-4 shadow-lg flex flex-col overflow-y-auto">
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

            <TimeSlotsPicker
              timeSlots={timeSlots}
              watchDate={watchDate}
              watchTime={watchTime}
              isSlotBooked={isSlotBooked}
              setValue={setValue}
              setShowTimeSlots={setShowTimeSlots}
              isLoading={slotsLoading}
              error={slotsError}
              onRetry={refetchSlots}
            />
          </div>
        </div>
      )}

      <div className="bg-white shadow-2xl rounded-2xl p-6 w-full max-w-lg relative">
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

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                    ${
                      currentStep >= step.id
                        ? "bg-blue-600 text-white"
                        : currentStep === step.id
                          ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                          : "bg-gray-200 text-gray-500"
                    }
                  `}
                >
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                      w-8 h-1 mx-1 transition-all duration-300
                      ${currentStep > step.id ? "bg-blue-600" : "bg-gray-200"}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-blue-800">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-sm text-gray-600">
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
                            p-4 rounded-xl border-2 transition-all duration-200 text-left transform hover:scale-[1.02]
                            ${
                              isSelected
                                ? `${option.selectedBg} ${option.borderColor} border-opacity-100 shadow-md`
                                : `${option.bgColor} ${option.borderColor} border-opacity-50 hover:border-opacity-100 hover:shadow-sm`
                            }
                          `}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-lg ${option.bgColor}`}>
                              <IconComponent
                                className={`w-6 h-6 ${option.color}`}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">
                                {option.label}
                              </h4>
                              <p className="text-sm text-gray-600">
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
                          className="w-full pl-10 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-black"
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

          {/* Step 2: Doctor Selection */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 gap-3">
                {doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => {
                      setValue("doctorId", doctor.id);
                      setValue("date", null);
                      setValue("time", "");
                    }}
                    className={`p-4 border-2 rounded-xl text-left transition-all duration-200 transform hover:scale-[1.02] ${
                      selectedDoctorId === doctor.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    <span className="font-semibold text-gray-800 block">
                      {doctor.name}
                    </span>
                    <span className="text-sm text-gray-500 block">
                      Available: {doctor.startTime} - {doctor.endTime}
                    </span>
                  </button>
                ))}
              </div>
              {errors.doctorId && (
                <p className="text-red-500 text-xs text-center">
                  {errors.doctorId.message}
                </p>
              )}
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
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
                    <input
                      {...field}
                      type="text"
                      placeholder={getNamePlaceholder()}
                      className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.name.message}
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
                    <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
                    <input
                      {...field}
                      type="number"
                      placeholder={getAgeLabel()}
                      className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
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
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                    <input
                      {...field}
                      type="tel"
                      placeholder={getWhatsAppPlaceholder()}
                      className="w-full pl-10 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
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
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCalendar(true);
                    setShowTimeSlots(false);
                  }}
                  className="flex items-center justify-between p-3 border-2 rounded-lg hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center">
                    <Calendar className="text-blue-500 w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
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
                  className={`flex items-center justify-between p-3 border-2 rounded-lg transition-all ${
                    !watchDate
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:border-blue-300"
                  }`}
                  disabled={!watchDate}
                >
                  <div className="flex items-center">
                    <Clock className="text-blue-500 w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
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

              {/* Reason Field */}
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-blue-500 w-4 h-4" />
                    <textarea
                      {...field}
                      placeholder="Reason for Appointment (Optional)"
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                )}
              />
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
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-medium">
                      {doctors.find((d) => d.id === selectedDoctorId)?.name ||
                        "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient Name:</span>
                    <span className="font-medium">
                      {watch("name") || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{watch("age") || "N/A"}</span>
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

                  {watch("reason") && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium">{watch("reason")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all duration-200
                ${
                  currentStep === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }
              `}
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-all duration-200
                  ${
                    !validateStep(currentStep)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }
                `}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={confirmBooking}
                disabled={
                  isSubmitting || !selectedDoctorId || !watchDate || !watchTime
                }
                className={`
                  px-6 py-2 rounded-lg font-medium transition-all duration-200
                  ${
                    isSubmitting ||
                    !selectedDoctorId ||
                    !watchDate ||
                    !watchTime
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Booking...
                  </span>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClinicDrForms;
