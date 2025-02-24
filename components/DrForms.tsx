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
} from "lucide-react";
import { BookedSlots } from "@/actions/BookSlots";
import Image from "next/image";
import { SubmitHandlerAll } from "@/actions/SubmitHandlers";

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
  date: z.date({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time slot" }),
});

export interface AllAppointmentFormData {
  name: string;
  age: string;
  whatsapp: string;
  date: Date | null;
  time: string;
  reason?: string;
}

interface BookedAppointments {
  [date: string]: string[];
}

interface TimeSlot {
  time: string;
  label: string;
  ampm: string;
}

const DrForms = ({
  doctorid,
  imageSrc,
  starting,
  ending,
}: {
  doctorid: number;
  imageSrc: string;
  starting: string;
  ending: string;
}) => {
  const [bookedAppointments, setBookedAppointments] = useState<{
    [date: string]: string[];
  }>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pendingBookings, setPendingBookings] = useState<Set<string>>(
    new Set()
  );
  const [lastPollTime, setLastPollTime] = useState(Date.now());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const POLL_INTERVAL = 10000; // 10 seconds

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
      name: "",
      age: "",
      whatsapp: "",
      date: null,
      time: "",
    },
  });

  const watchDate = watch("date");
  const watchTime = watch("time");

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

  const onSubmit: SubmitHandler<AllAppointmentFormData> = async (data) => {
    if (!data.date) return;

    try {
      addPendingBooking(data.date, data.time);

      const result = await SubmitHandlerAll(data, doctorid); // Call the server-side handler

      if (result?.success) {
        setSubmitted(true); // Mark form as submitted
      } else {
        setPendingBookings((prev) => {
          const newSet = new Set(prev);
          newSet.delete(
            `${data.date?.toLocaleDateString("en-CA")}-${data.time}`
          );
          return newSet;
        });
        toast.error("Unable to book the slot. Please try again.");
      }

      // Refresh booked slots after submission
      const newSlots = await BookedSlots(doctorid);
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
      console.error("Error during form submission:", err); // Log error for debugging
      toast.error("Something went wrong. Please try again."); // Generic error message
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
        const slotKeys = await BookedSlots(doctorid);

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

    // Cleanup function to clear the interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [doctorid, lastPollTime]);

  if (submitted) {
    const submittedData = watch();
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-200 to-blue-400 flex flex-col md:flex-row  md:items-center md:justify-center z-50 p-4 gap-4">
        <Image
          src={imageSrc}
          alt="Doctor logo"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col md:flex-row md:items-center md:justify-center p-4 gap-5">
      <ToastContainer />

      {/* Sliding Calendar Panel */}
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
                    text-sm p-2 rounded-full
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

      {/* Sliding Time Slots Panel */}
      {showTimeSlots && timeSlots.length > 0 && (
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
                  className={`text-sm p-3 rounded-lg border font-medium
                    ${
                      isSlotBooked(watchDate, time)
                        ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
                        : watch("time") === time
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-green-700 border-green-200 hover:bg-green-50"
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

      <Image src={imageSrc} alt="Doctor logo" width={500} height={300} />
      <div className="bg-white shadow-2xl rounded-2xl p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">
          Book Your Appointment
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                <input
                  {...field}
                  type="number"
                  placeholder="Age"
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black"
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
                  placeholder="WhatsApp Number"
                  className="w-full pl-10 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-black"
                />
                {errors.whatsapp && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.whatsapp.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Date and Time Selection Buttons */}
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
                    ? new Date(`2000-01-01T${watchTime}`).toLocaleTimeString(
                        "en-US",
                        { hour: "numeric", minute: "2-digit", hour12: true }
                      )
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
                <p className="text-red-500 text-xs">{errors.date.message}</p>
              )}
            </div>
            <div className="w-1/2">
              {errors.time && (
                <p className="text-red-500 text-xs">{errors.time.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !watchDate || !watchTime}
            className={`
              w-full bg-blue-600 text-white px-6 py-3 rounded-full
              hover:bg-blue-700 transition-all duration-200
              ${isSubmitting || !watchDate || !watchTime ? "opacity-50 cursor-not-allowed" : ""}
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

export default DrForms;
