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
  Cake,
} from "lucide-react";
import { BookedSlots } from "@/actions/BookSlots";
import Image from "next/image";
import { SubmitHandlerArunaEnt } from "@/actions/SubmitHandlers";
import AppointmentBookingFormSkeleton from "./AppointmentBookingFormSkeleton";

const locationOptions = [
  {
    name: "Zenith ENT and SKIN Clinic",
    hours: "9:00 am to 1:00 pm",
  },
  {
    name: "MERAKI ENT INTERNATIONAL HOSPITAL",
    hours: "2:00 pm to 4:00 pm",
  },
  {
    name: "Sri Sri Clinic (Center for Health & Aesthetics)",
    hours: "4:00 pm to 9:00 pm",
  },
];

// Define schema for form validation
const AppointmentSchema = z.object({
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
  location: z.enum(
    locationOptions.map((loc) => loc.name) as [string, ...string[]],
    {
      errorMap: () => ({ message: "Please select a location" }),
    }
  ),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time slot" }),
});
export interface DrArunaEntFormProps {
  name: string;
  age: string;
  whatsapp: string;
  location: string;
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

const DrArunaEntForm = () => {
  const [bookedAppointments, setBookedAppointments] =
    useState<BookedAppointments>({});
  const [isClient, setIsClient] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<Set<string>>(
    new Set()
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [lastPollTime, setLastPollTime] = useState(Date.now());
  const POLL_INTERVAL = 3000; // 3 seconds

  // Location and service configurations

  const locationTimeSlots: { [key: string]: string[] } = {
    "Zenith ENT and SKIN Clinic": [
      "09:00",
      "09:20",
      "09:40",
      "10:00",
      "10:20",
      "10:40",
      "11:00",
      "11:20",
      "11:40",
      "12:00",
      "12:20",
      "12:40",
      "13:00",
    ],
    "MERAKI ENT INTERNATIONAL HOSPITAL": [
      "14:00",
      "14:20",
      "14:40",
      "15:00",
      "15:20",
      "15:40",
      "16:00",
    ],
    "Sri Sri Clinic (Center for Health & Aesthetics)": [
      "16:00",
      "16:20",
      "16:40",
      "17:00",
      "17:20",
      "17:40",
      "18:00",
      "18:20",
      "18:40",
      "19:00",
      "19:20",
      "19:40",
      "20:00",
      "20:20",
      "20:40",
      "21:00",
    ],
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DrArunaEntFormProps>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      name: "",
      age: "",
      whatsapp: "",
      location: "",
      date: null,
      time: "",
    },
  });

  const watchLocation = watch("location");
  const watchDate = watch("date");
  const watchTime = watch("time");

  // Dynamic time slots based on location

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
        const newSlots = await BookedSlots(28);
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
  const onSubmit = async (data: DrArunaEntFormProps) => {
    if (!data.date) return;

    try {
      addPendingBooking(data.date, data.time);

      const result = await SubmitHandlerArunaEnt(data);
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
      const isWednesday = location === "Kukatpally" && dateIST.getDay() === 3;

      days.push({
        day,
        date: dateIST,
        disabled: isPastDate || isSunday || isWednesday,
      });
    }

    return days;
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-blue-400 ">
        <Image
          src="/dr-aruna.webp" // Path to your image in the public folder
          alt="Dr.Aruna"
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
          src="/dr-aruna.webp" // Path to your image in the public folder
          alt="Dr.Aruna"
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
        src="/dr-aruna.webp"
        alt="Dr.Aruna"
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
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                <input
                  {...field}
                  type="tel"
                  placeholder="WhatsApp Number"
                  className="w-full pl-10 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-black"
                />
                {errors?.whatsapp && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.whatsapp.message}
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

export default DrArunaEntForm;
