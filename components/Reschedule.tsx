"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appointmentDetails } from "@/actions/SendMessage";
import { BookedSlots } from "@/actions/BookSlots";
import { SendRescheduleMessageBMT } from "@/actions/SendMessageBmt";

interface BookedAppointments {
  [date: string]: string[];
}

interface RescheduleModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  appointmentId?: number | null;
}

const SuccessMessage = ({
  selectedDate,
  selectedTime,
  name,
  location,
  onClose,
}: {
  selectedDate: Date | null;
  selectedTime: string;
  name: string;
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
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
            <p className="font-semibold text-lg">
              <span className="text-red-500">{name}</span>
            </p>
            <p className="text-sm text-gray-600">{formattedDate}</p>
            <p className="text-sm text-gray-600">{formattedTime}</p>
            <p className="text-sm text-gray-600">{location}</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [bookedAppointments, setBookedAppointments] =
    useState<BookedAppointments>({});
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [isProcess, setIsprocess] = useState(false);

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

  const generateTimeSlots = (date: Date | null) => {
    if (!date || !location) return [];

    const selectedDateIST = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const availableSlots = locationTimeSlots[location] || [];

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
  }, [selectedDate, location]);

  useEffect(() => {
    if (isOpen && !loading) {
      // const timer = setTimeout(() => {
      //   if (modalRef.current) {
      //     modalRef.current.scrollIntoView({
      //       behavior: "smooth",
      //       block: "start",
      //     });
      //   }
      // }, 100); // Small delay to ensure DOM is ready
      if (modalRef.current) {
        modalRef.current.scrollIntoView({
          behavior: "instant",
        });
      }

      // return () => clearTimeout(timer);
    }
  }, [isOpen, loading]);

  // Separate useEffect for data fetching
  useEffect(() => {
    async function fetchDetails() {
      if (!isOpen || !appointmentId) return;

      try {
        setLoading(true);
        const details = await appointmentDetails(appointmentId);

        if (details) {
          setLocation(details?.location ?? null);
          setName(details?.patient?.name ?? "");

          if (details?.doctor?.id) {
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
        }
      } catch (error) {
        console.error("Error fetching appointment details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [appointmentId, isOpen]);

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
        const result = await SendRescheduleMessageBMT({
          appointmentId,
          selectedDate,
          selectedTime,
        });
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

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Trick to center modal */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl relative z-50">
          {success ? (
            <SuccessMessage
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              name={name}
              location={location}
              onClose={() => onClose?.()}
            />
          ) : (
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-blue-800">
                  Reschedule Appointment for{" "}
                  <span className="text-red-500">{name}</span>
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Calendar Section */}
              <div className="bg-gray-50 rounded-lg p-4">
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
                    <div key={day} className="text-xs text-black font-medium">
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
                        text-xs p-1 rounded-full transition-colors
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
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h3 className="text-sm font-semibold text-black mb-2">
                    Available Time Slots
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(({ time, ampm }) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        disabled={isSlotBooked(selectedDate, time)}
                        className={`
                          text-xs p-2 rounded-lg border font-medium transition-colors
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

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReschedule}
                  disabled={!selectedDate || !selectedTime || isProcess}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcess ? "confirming...." : "confirm schedule"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
