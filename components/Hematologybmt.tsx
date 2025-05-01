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
} from "lucide-react";
import { BookedSlots } from "@/actions/BookSlots";
import Image from "next/image";
import { SubmitHandlerBMT } from "@/actions/SubmitHandlers";
import AppointmentBookingFormSkeleton from "./AppointmentBookingFormSkeleton";

// Define schema for form validation
const AppointmentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
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

const Hematologybmt = () => {
  const [bookedAppointments, setBookedAppointments] =
    useState<BookedAppointments>({});
  const [isClient, setIsClient] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<Set<string>>(
    new Set()
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [lastPollTime, setLastPollTime] = useState(Date.now());
  const [countryCode, setCountryCode] = useState("+91");
  const POLL_INTERVAL = 3000; // 3 seconds

  // Location and service configurations
  const locationOptions = [
    {
      name: "Financial District",
      hours: "10:00 am to 4:00 pm",
    },
    {
      name: "Kukatpally",
      hours: "6:00 pm to 8:30 pm",
    },
  ];

  const locationTimeSlots: { [key: string]: string[] } = {
    "Financial District": [
      "10:00",
      "10:20",
      "10:40",
      "11:00",
      "11:20",
      "11:40",
      "12:00",
      "12:20",
      "12:40",
      "14:00",
      "14:20",
      "14:40",
      "15:00",
      "15:20",
      "15:40",
    ],
    Kukatpally: ["18:00", "18:20", "18:40", "19:20", "19:40", "20:00", "20:20"],
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

  // Reset date and time when location changes
  useEffect(() => {
    setValue("date", null);
    setValue("time", "");
  }, [watchLocation, setValue]);

  // Dynamic time slots based on location

  const Services = [
    "Other",
    "Immunotherapy",
    "CAR T- Cells",
    "Half Matched Transplant BMT",
    "Allogeneic BMT",
    "Unrelated BMT",
    "Autologous BMT",
    "Erdheim Chester Disease",
    "VEXAS Syndrome",
    "Bone Marrow Examination/Testing",
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

  // Generate time slots based on location
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

    return locationTimeSlots[location]
      .map((time) => {
        const [hours, minutes] = time.split(":");
        const slotDate = new Date(selectedDate);
        slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const now = new Date();
        const currentTime = new Date(
          now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );

        if (
          selectedDate.toDateString() === currentTime.toDateString() &&
          slotDate < currentTime
        ) {
          return null;
        }

        return {
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
      })
      .filter((slot): slot is TimeSlot => slot !== null);
  };

  const timeSlots = useMemo(() => {
    return generateTimeSlots(watchLocation, watchDate);
  }, [watchLocation, watchDate]);

  const isSlotBooked = (date: Date, time: string): boolean => {
    if (!date) return false;
    const dateKey = date.toLocaleDateString("en-CA");
    const bookingKey = `${dateKey}-${time}`;

    return Boolean(
      bookedAppointments[dateKey]?.includes(time) ||
        pendingBookings.has(bookingKey)
    );
  };

  // Enhanced submit handler with optimistic updates
  const onSubmit = async (data: BMTAppointmentFormData) => {
    if (!data.date) return;

    try {
      addPendingBooking(data.date, data.time);

      // Add country code to the phone number
      const dataWithPrefix = {
        ...data,
        whatsapp: countryCode + data.whatsapp,
      };

      const result = await SubmitHandlerBMT(dataWithPrefix);
      if (result?.success) {
        setSubmitted(true);
      }
      if (!result?.success) {
        setPendingBookings((prev) => {
          const newSet = new Set(prev);
          newSet.delete(
            `${data.date?.toLocaleDateString("en-CA")}-${data.time}`
          );
          return newSet;
        });
        toast.error("Unable to book the slot. Please try again.");
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
    }
  };

  // Calendar generation function
  const generateCalendarDays = (location: string) => {
    const indianTimezone = "Asia/Kolkata";

    // Get the current date in Indian timezone
    const currentDateUTC = new Date();
    // Use currentMonth instead of current date for generating calendar
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
      // Create a date for the specific day
      const dateUTC = new Date(year, month, day);

      // Convert the date to Indian timezone
      const dateIST = new Date(
        dateUTC.toLocaleString("en-US", { timeZone: indianTimezone })
      );

      // Create a Date object for today in IST and reset time
      const todayIST = new Date(
        currentDateUTC.toLocaleString("en-US", { timeZone: indianTimezone })
      );
      todayIST.setHours(0, 0, 0, 0);
      dateIST.setHours(0, 0, 0, 0);

      // Check if the current date is in the past, is a Sunday, or is a Wednesday (only if location is Kukatpally)
      const isPastDate = dateIST.getTime() < todayIST.getTime();
      const isSunday = dateIST.getDay() === 0;
      const isThursday = location === "Kukatpally" && dateIST.getDay() === 4;

      days.push({
        day,
        date: dateIST,
        disabled: isPastDate || isSunday || isThursday,
      });
    }

    return days;
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-blue-400 ">
        <Image
          src="/BmtLogo.png" // Path to your image in the public folder
          alt="Dr.S.K.Gupta"
          width={500} // Specify the width of the image
          height={300} // Specify the height of the image
        />
        <AppointmentBookingFormSkeleton />
      </div>
    );
  }

  if (submitted) {
    const submittedData = watch();
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-200 to-blue-400 flex flex-col md:flex-row  md:items-center md:justify-center z-50 p-4">
        <Image
          src="/BmtLogo.png" // Path to your image in the public folder
          alt="Dr.S.K.Gupta"
          width={500} // Specify the width of the image
          height={300} // Specify the height of the image
        />

        <div className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-sm w-full">
          <Heart className="mx-auto text-green-500 w-24 h-24 mb-4" />
          <h2 className="text-3xl font-bold text-blue-800 mb-4">
            Appointment Received!
          </h2>
          <div className="space-y-2 text-gray-700 mb-6">
            <p>Name: {submittedData?.name || "N/A"}</p>
            <p>Location: {submittedData?.location || "N/A"}</p>
            <p>Service: {submittedData?.service || "N/A"}</p>
            <p>
              Date:
              {submittedData?.date
                ? new Date(submittedData.date).toLocaleDateString("en-GB") // 'en-GB' gives DD/MM/YYYY format
                : "N/A"}
            </p>
            <p>Time: {submittedData?.time || "N/A"}</p>
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

  const TimeSlotButton: React.FC<{
    time: string;
    ampm: string;
    date: Date;
  }> = ({ time, ampm, date }) => (
    <button
      type="button"
      onClick={() => setValue("time", time, { shouldValidate: true })}
      disabled={isSlotBooked(date, time)}
      className={`
        text-xs p-2 rounded-lg border font-medium transition-all duration-200
        ${
          isSlotBooked(date, time)
            ? "bg-red-300 text-black cursor-not-allowed opacity-50"
            : watchTime === time
              ? "bg-green-800 text-white border-green-600 scale-105"
              : "bg-green-300 text-black border-gray-300 hover:bg-green-200 hover:scale-105"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col md:flex-row md:items-center md:justify-center p-4">
      <ToastContainer />
      <Image
        src="/BmtLogo.png"
        alt="Dr.S.K.Gupta"
        width={500}
        height={300}
        className="mb-4 md:mb-0 md:mr-8"
      />
      <div className="bg-white shadow-2xl rounded-2xl p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">
          Book Your Appointment
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Location Selection */}
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                <select
                  {...field}
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black"
                >
                  <option value="">Select Location</option>
                  {locationOptions.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name} ({loc.hours})
                    </option>
                  ))}
                </select>
                {errors?.location && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Service Selection */}
          <Controller
            name="service"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                <select
                  {...field}
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black"
                >
                  <option value="">Select Service</option>
                  {Services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
                {errors?.service && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.service.message}
                  </p>
                )}
              </div>
            )}
          />

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
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black"
                />
                {errors?.name && (
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
                <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                <input
                  {...field}
                  type="number"
                  placeholder="Age"
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black"
                />
                {errors?.age && (
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
                    placeholder="WhatsApp Number"
                    className="w-full py-3 px-4 border-2 border-green-200 rounded-r-lg focus:outline-none focus:border-green-500 transition-colors text-black"
                  />
                </div>
                {errors?.whatsapp && (
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
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black"
                />
                {errors?.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Calendar Section */}
          {watchLocation && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => {
                    const newMonth = new Date(currentMonth);
                    newMonth.setMonth(currentMonth.getMonth() - 1);
                    setCurrentMonth(newMonth);
                  }}
                  className="text-blue-600 hover:bg-blue-100 p-1 rounded-full transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-semibold text-black">
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
                  className="text-blue-600 hover:bg-blue-100 p-1 rounded-full transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "Th", "F", "St"].map((day) => (
                  <div key={day} className="text-xs text-black font-medium">
                    {day}
                  </div>
                ))}

                {generateCalendarDays(watchLocation).map((dayObj, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      if (dayObj && !dayObj.disabled) {
                        setValue("date", dayObj.date, {
                          shouldValidate: true,
                        });
                        setValue("time", "", { shouldValidate: true });
                      }
                    }}
                    disabled={dayObj === null || (dayObj && dayObj.disabled)}
                    className={`
                      text-xs p-1 rounded-full transition-colors
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
                          : "hover:bg-blue-100 text-black"
                      }
                    `}
                  >
                    {dayObj ? dayObj.day : ""}
                  </button>
                ))}
              </div>
              {errors?.date && (
                <p className="text-red-500 text-xs mt-1 text-center">
                  {errors.date.message}
                </p>
              )}
            </div>
          )}

          {/* Time Slots */}
          {watchDate && timeSlots.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-black mb-2">
                Available Time Slots
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(({ time, ampm }) => (
                  <TimeSlotButton
                    key={time}
                    time={time}
                    ampm={ampm}
                    date={watchDate}
                  />
                ))}
              </div>
              {errors?.time && (
                <p className="text-red-500 text-xs mt-1 text-center">
                  {errors.time.message}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full bg-blue-600 text-white px-6 py-3 rounded-full
              hover:bg-blue-700 transition-all duration-200
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Booking...
              </span>
            ) : (
              "Book Appointment"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Hematologybmt;
