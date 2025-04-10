"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { appointmentDetails } from "@/actions/SendMessage";
import { BookedSlots } from "@/actions/BookSlots";
import {
  SendRescheduleMessageAll,
  SendRescheduleMessageBMT,
  SendRescheduleMessageRagas,
} from "@/actions/SendMessageBmt";
import { useRouter } from "next/navigation";

interface BookedAppointments {
  [date: string]: string[];
}

interface ReschedulePageProps {
  appointmentId?: number | null;
}

const SuccessMessage = ({
  selectedDate,
  selectedTime,
  patientName,
  doctorName,
  location,
  onClose,
}: {
  selectedDate: Date | null;
  selectedTime: string;
  patientName: string;
  doctorName: string;
  location: string | null;
  onClose: () => void;
}) => {
  const formattedDate = selectedDate?.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(
    `2000-01-01T${selectedTime}`
  ).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-blue-800">
          Appointment Rescheduled Successfully
        </h2>
      </div>

      {/* Success Content */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>

          <div className="text-center space-y-2">
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-lg">
                <span className="text-red-500">{patientName}</span>
              </p>
              <p className="text-sm font-medium text-blue-700">
                with Dr. {doctorName}
              </p>
            </div>
            <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <Calendar className="h-4 w-4" /> {formattedDate}
            </p>
            <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" /> {formattedTime}
            </p>
            {location && location.trim() !== "" && (
              <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <MapPin className="h-4 w-4" /> {location}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

const RescheduleDynamic: React.FC<ReschedulePageProps> = ({
  appointmentId,
}) => {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [noappointment, setNoappointment] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [bookedAppointments, setBookedAppointments] =
    useState<BookedAppointments>({});
  const [patientName, setPatientName] = useState<string>("");
  const [doctorName, setDoctorName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [isProcess, setIsprocess] = useState(false);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [doctorTimings, setDoctorTimings] = useState<{
    [key: string]: string[];
  } | null>(null);

  const generateTimeSlots = (date: Date | null) => {
    if (!date || !doctorTimings) return [];

    const selectedDateIST = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    // Choose time slots based on whether location is available
    const availableSlots =
      location && location.trim() !== "" && doctorTimings[location]
        ? doctorTimings[location]
        : doctorTimings["nolocation"] || [];

    return availableSlots
      .map((time) => {
        const [hours, minutes] = time.split(":");
        const slotDate = new Date(selectedDateIST);
        slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const now = new Date();
        const currentTime = new Date(
          now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );

        if (
          selectedDateIST.toDateString() === currentTime.toDateString() &&
          slotDate < currentTime
        ) {
          return null;
        }

        return {
          time,
          ampm: new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          }).format(slotDate),
        };
      })
      .filter((slot): slot is { time: string; ampm: string } => slot !== null);
  };

  const timeSlots = useMemo(() => {
    return generateTimeSlots(selectedDate);
  }, [selectedDate, location, doctorTimings]);

  // Fetch appointment details
  useEffect(() => {
    async function fetchDetails() {
      if (!appointmentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const details = await appointmentDetails(appointmentId);

        console.log("Appointment details:", details);

        if (details) {
          // Only set location if it exists and isn't empty
          setLocation(
            details?.location && details.location.trim() !== ""
              ? details.location
              : null
          );
          setPatientName(details?.patient?.name ?? "");
          setDoctorName(details?.doctor?.name ?? "");

          if (details?.doctor?.id) {
            setDoctorId(details.doctor.id);

            // Set doctor timings if available
            if (details.doctor.timings) {
              setDoctorTimings(
                details.doctor.timings as { [key: string]: string[] }
              );
            } else {
              // Fallback to default timing structure if not available in database
              setDoctorTimings({
                nolocation: [
                  "10:00",
                  "10:30",
                  "11:00",
                  "11:30",
                  "12:00",
                  "12:30",
                  "13:00",
                  "13:30",
                  "14:00",
                  "14:30",
                  "15:00",
                  "15:30",
                  "16:00",
                  "16:30",
                  "17:00",
                  "17:30",
                  "18:00",
                  "18:30",
                  "19:00",
                  "19:30",
                  "20:00",
                  "20:30",
                  "21:00",
                ],
              });
            }

            const slotKeys = await BookedSlots(details.doctor.id);

            if (slotKeys && slotKeys.length > 0) {
              const updatedAppointments = slotKeys.reduce<BookedAppointments>(
                (acc, data) => {
                  if (data.dateKey && data.time) {
                    acc[data.dateKey] = [
                      ...(acc[data.dateKey] || []),
                      data.time,
                    ];
                  }
                  return acc;
                },
                {}
              );

              setBookedAppointments(updatedAppointments);
            }
          }
        } else {
          console.error(`No appointment found with ID: ${appointmentId}`);
          setNoappointment(true);
        }
      } catch (error) {
        console.error("Error fetching appointment details:", error);
        setNoappointment(true);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [appointmentId]);

  const isSlotBooked = (date: Date | null, time: string): boolean => {
    if (!date) return false;
    const dateKey = date.toLocaleDateString("en-CA");
    return bookedAppointments[dateKey]?.includes(time) ?? false;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateIST = new Date(year, month, day);
      const isPastDate = dateIST < currentDate;
      const isSunday = dateIST.getDay() === 0;

      days.push({
        day,
        date: dateIST,
        disabled: isPastDate || isSunday,
      });
    }

    return days;
  };

  const handleReschedule = async () => {
    if (selectedDate && selectedTime) {
      console.log("Rescheduling appointment", {
        appointmentId,
        selectedDate,
        selectedTime,
      });
      if (appointmentId) {
        setIsprocess(true);
        let result;
        if (doctorId == 1) {
          result = await SendRescheduleMessageBMT({
            appointmentId,
            selectedDate,
            selectedTime,
          });
        } else if (doctorId == 20 || doctorId == 27) {
          result = await SendRescheduleMessageRagas({
            appointmentId,
            selectedDate,
            selectedTime,
          });
        } else {
          result = await SendRescheduleMessageAll({
            appointmentId,
            selectedDate,
            selectedTime,
          });
        }

        if (result === true) {
          setSuccess(true);
          setIsprocess(false);
        } else {
          alert(result);
          setIsprocess(false);
        }
      }
    }
  };

  const handleCloseSuccess = () => {
    router.push("/dashboard"); // Navigate to dashboard or appropriate page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg">Loading...</div>
      </div>
    );
  }

  if (noappointment) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-50 mb-4">
          <svg
            className="w-8 h-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          No Appointment Found
        </h2>
        <p className="text-gray-500 text-center">
          We couldn't find any appointments matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div ref={contentRef} className="container mx-auto py-8 px-4">
      {success ? (
        <SuccessMessage
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          patientName={patientName}
          doctorName={doctorName}
          location={location}
          onClose={handleCloseSuccess}
        />
      ) : (
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-blue-800">
                  Reschedule Appointment
                </h2>

                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-red-500" />
                    <p className="text-lg font-medium text-red-500">
                      {patientName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <p className="text-md font-medium text-blue-600">
                      Dr. {doctorName}
                    </p>
                  </div>
                </div>
                {location && (
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <p className="text-md font-medium text-green-600">
                      {location}
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-600 mt-2">
                  Please select a new date and time for your appointment
                </p>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
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

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Day Headers */}
                {["S", "M", "T", "W", "Th", "F", "St"].map((day) => (
                  <div
                    key={day}
                    className="text-xs text-black font-medium py-1"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {generateCalendarDays().map((dayObj, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (dayObj && !dayObj.disabled) {
                        setSelectedDate(dayObj.date);
                        setSelectedTime("");
                      }
                    }}
                    disabled={dayObj === null || (dayObj && dayObj.disabled)}
                    className={`
                      text-xs p-2 rounded-full transition-colors
                      ${dayObj === null ? "invisible" : ""}
                      ${
                        dayObj && dayObj.disabled
                          ? "text-gray-300 cursor-not-allowed"
                          : ""
                      }
                      ${
                        selectedDate &&
                        dayObj &&
                        selectedDate.toDateString() ===
                          dayObj.date.toDateString()
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-100 text-black"
                      }
                    `}
                  >
                    {dayObj ? dayObj.day : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots Section */}
            {selectedDate && timeSlots.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-black mb-3">
                  Available Time Slots
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map(({ time, ampm }) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      disabled={isSlotBooked(selectedDate, time)}
                      className={`
                        text-xs p-3 rounded-lg border font-medium transition-colors
                        ${
                          isSlotBooked(selectedDate, time)
                            ? "bg-red-300 text-black cursor-not-allowed"
                            : selectedTime === time
                              ? "bg-green-800 text-white border-green-600"
                              : "bg-green-300 text-black border-gray-300 hover:bg-green-200 hover:text-black"
                        }
                      `}
                    >
                      {ampm}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Date/Time Summary */}
            {selectedDate && selectedTime && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  Your Selected Appointment
                </h3>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-700">Dr. {doctorName}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-700">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-700">
                      {new Date(
                        `2000-01-01T${selectedTime}`
                      ).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                  </div>

                  {location && location.trim() !== "" && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <p className="text-sm text-gray-700">{location}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="px-4 py-2"
              >
                Go Back
              </Button>
              <Button
                onClick={handleReschedule}
                disabled={!selectedDate || !selectedTime || isProcess}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcess ? "Confirming..." : "Confirm Reschedule"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescheduleDynamic;
