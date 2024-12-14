// "use client";
// import React, { useState, useMemo, useEffect } from "react";
// import { useForm, Controller, SubmitHandler } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   Heart,
//   User,
//   Phone,
//   ChevronLeft,
//   ChevronRight,
//   MapPin,
//   Stethoscope,
//   Cake,
// } from "lucide-react";
// import { findDoctorById } from "@/actions/Doctor";
// import { createPatient, findPatientByPhone } from "@/actions/patient";
// import { CreateTimeSlot } from "@/actions/CreateTimeslot";
// import { CreateAppointment } from "@/actions/CreateAppointment";
// import { BookedSlots } from "@/actions/BookSlots";
// import { sendMessage } from "@/actions/SendMessage";
// import AppointmentBookingFormSkeleton from "./AppointmentBookingFormSkeleton";
// import Image from "next/image";

// // Define schema for form validation
// const AppointmentSchema = z.object({
//   name: z.string().min(2, { message: "Name must be at least 2 characters" }),
//   age: z
//     .string()
//     .refine((val) => !isNaN(parseInt(val)), { message: "Age must be a number" })
//     .refine((val) => parseInt(val) > 0 && parseInt(val) < 120, {
//       message: "Age must be between 1 and 120",
//     }),
//   whatsapp: z
//     .string()
//     .regex(/^\d+$/, { message: "WhatsApp number must be numeric" })
//     .min(10, { message: "Check the number" }),
//   date: z.date({ required_error: "Please select a date" }),
//   time: z.string({ required_error: "Please select a time slot" }),
// });

// // Type for form data
// interface DoctorTypes {
//   id: number;
//   name: string;
//   website: string;
//   whatsapp?: string | null; // Optional, allows null
//   services?: ServiceTypes[]; // Optional
//   timeslots?: TimeslotTypes[]; // Optional
//   appointments: AppointmentTypes[]; // Required field, cannot be missing
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface ServiceTypes {
//   name: string;
//   id: number;
//   doctorId: number;
// }

// interface TimeslotTypes {
//   id: number;
//   doctorId: number;
//   isAvailable: boolean;
//   startTime: Date;
//   serviceId: number;
// }

// interface AppointmentTypes {
//   id: number;
//   date: Date;
//   status: string;
//   doctorId: number;
//   patientId: number;
//   serviceId: number;
// }

// interface AppointmentFormData {
//   name: string;
//   age: string;
//   whatsapp: string;
//   location: string;
//   service: string;
//   date: Date | null;
//   time: string;
// }

// interface BookedAppointments {
//   [date: string]: string[];
// }

// const DrAvaniReddy = () => {
//   const [bookedAppointments, setBookedAppointments] = useState<{
//     [date: string]: string[];
//   }>({});
//   const [loading, setLoading] = useState(true);
//   const [submitted, setSubmitted] = useState(false);
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [doctor, setDoctor] = useState<DoctorTypes | null>(null);
//   const {
//     control,
//     handleSubmit,
//     watch,
//     setValue,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm<AppointmentFormData>({
//     resolver: zodResolver(AppointmentSchema),
//     defaultValues: {
//       name: "",
//       age: "",
//       whatsapp: "",
//       date: null,
//       time: "",
//     },
//   });

//   const watchDate = watch("date");

//   // Dynamic time slots based on location
//   const generateTimeSlots = (date: Date | null) => {
//     if (!date) {
//       return [];
//     }

//     // Convert the provided date to the Asia/Kolkata timezone
//     const selectedDate = new Date(
//       date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
//     );

//     // Define the start and end times in hours (24-hour format)
//     const startHour = 10; // 10:00 AM
//     const endHour = 21; // 9:00 PM

//     // Generate an array of time slots
//     const timeSlots = [];
//     for (let hour = startHour; hour <= endHour; hour++) {
//       for (let minute = 0; minute < 60; minute += 30) {
//         // 30-minute intervals
//         const slotDate = new Date(selectedDate);
//         slotDate.setHours(hour, minute, 0, 0);

//         // Get the current time in the Asia/Kolkata timezone
//         const now = new Date();
//         const currentTime = new Date(
//           now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
//         );

//         // Skip past time slots for today
//         if (
//           selectedDate.toDateString() === currentTime.toDateString() &&
//           slotDate < currentTime
//         ) {
//           continue;
//         }

//         // Format the time slot
//         const formattedSlot = {
//           time: `${hour.toString().padStart(2, "0")}:${minute
//             .toString()
//             .padStart(2, "0")}`,
//           label: new Intl.DateTimeFormat("en-US", {
//             hour: "2-digit",
//             minute: "2-digit",
//             timeZone: "Asia/Kolkata",
//           }).format(slotDate),
//           ampm: new Intl.DateTimeFormat("en-US", {
//             hour: "2-digit",
//             minute: "2-digit",
//             hour12: true,
//             timeZone: "Asia/Kolkata",
//           }).format(slotDate),
//         };

//         timeSlots.push(formattedSlot);
//       }
//     }

//     return timeSlots;
//   };

//   const timeSlots = useMemo(() => {
//     return generateTimeSlots(watchDate);
//   }, [watchDate]);

//   const isSlotBooked = (date: Date, time: string) => {
//     if (!date) return false;
//     const tempDate = new Date(date);
//     const normalizedDate = new Date(
//       tempDate.getFullYear(),
//       tempDate.getMonth(),
//       tempDate.getDate()
//     );

//     // Format the date as YYYY-MM-DD using local date methods
//     const dateKey = normalizedDate.toLocaleDateString("en-CA");
//     return (
//       bookedAppointments[dateKey] && bookedAppointments[dateKey].includes(time)
//     );
//   };

//   const onSubmit: SubmitHandler<AppointmentFormData> = async (data) => {
//     if (!data.date) return false;

//     const date = new Date(data.date);

//     // Use local date methods to get year, month, and day
//     const normalizedDate = new Date(
//       date.getFullYear(),
//       date.getMonth(),
//       date.getDate()
//     );

//     // Format the date as YYYY-MM-DD using local date methods
//     const dateKey = normalizedDate.toLocaleDateString("en-CA"); // 'en-CA' gives YYYY-MM-DD format

//     let patient = await findPatientByPhone(data.whatsapp);
//     if (!patient) {
//       patient = await createPatient({
//         name: data.name,
//         age: data.age,
//         phone: data.whatsapp,
//       });
//     }
//     const service = doctor?.services?.find(
//       (service) => service.name === data.service
//     );
//     if (service?.id && doctor?.id) {
//       // Ensure the dateKey and data.time are valid
//       if (dateKey && data.time) {
//         const timeSlot = await CreateTimeSlot({
//           date: dateKey, // Date in 'YYYY-MM-DD'
//           time: data.time, // Time in 'HH:mm'
//           doctorid: doctor.id, // Doctor ID
//         });
//         const appointment = await CreateAppointment({
//           date: dateKey,
//           location: data.location,
//           timeslotId: timeSlot.id,
//           serviceId: service.id,
//           doctorId: doctor.id,
//           patientId: patient.id,
//         });
//         const result = await sendMessage(appointment);
//         if (result) {
//           setSubmitted(true);
//         } else {
//           toast.error("An unexpected error occurred");
//         }
//       } else {
//         toast.error("An unexpected error occurred");
//         console.error("Invalid date or time provided.");
//       }
//     } else {
//       toast.error("An unexpected error occurred");
//       console.error("Service or Doctor ID missing.");
//     }
//   };

//   // Calendar generation function
//   const generateCalendarDays = () => {
//     const year = currentMonth.getFullYear();
//     const month = currentMonth.getMonth();
//     const daysInMonth = new Date(year, month + 1, 0).getDate();
//     const firstDayOfMonth = new Date(year, month, 1).getDay();

//     const days = [];

//     // Add null values for the days before the 1st of the month
//     for (let i = 0; i < firstDayOfMonth; i++) {
//       days.push(null);
//     }

//     // Add the actual days of the month
//     for (let day = 1; day <= daysInMonth; day++) {
//       const date = new Date(year, month, day);
//       // Create a Date object for today with the time set to midnight
//       const today = new Date();
//       today.setHours(0, 0, 0, 0); // Reset the time to 00:00:00

//       // Check if the current date is in the past or is a Sunday
//       const isPastDate = date < today;
//       const isSunday = date.getDay() === 0; // Check if it's Sunday

//       days.push({ day, date, disabled: isPastDate || isSunday });
//     }

//     return days;
//   };

//   useEffect(() => {
//     const fetchDoctorData = async () => {
//       const DoctorDetails = await findDoctorById(1);
//       setDoctor(DoctorDetails as DoctorTypes | null);
//       const slotKeys = await BookedSlots(1);

//       if (slotKeys && slotKeys.length > 0) {
//         const updatedAppointments: BookedAppointments = slotKeys.reduce(
//           (acc, data) => {
//             acc[data.dateKey] = [...(acc[data.dateKey] || []), data.time];
//             return acc;
//           },
//           {} as BookedAppointments
//         ); // Type assertion to specify the type

//         // Merge the current appointments with the new updates
//         setBookedAppointments((prev) => ({
//           ...prev,
//           ...updatedAppointments,
//         }));
//         setLoading(false);
//       }
//     };
//     fetchDoctorData();
//   }, [submitted]);
//   // Success popup - similar to previous implementation
//   if (loading) {
//     return (
//       <div>
//         <div className="bg-gradient-to-br from-blue-200 to-blue-400 h-screen">
//           {" "}
//           <AppointmentBookingFormSkeleton />
//         </div>
//       </div>
//     );
//   }

//   if (submitted) {
//     const submittedData = watch();
//     return (
//       <div className="fixed inset-0 bg-gradient-to-br from-blue-200 to-blue-400 flex flex-col md:flex-row  md:items-center md:justify-center z-50 p-4">
//         <Image
//           src="/Dr-Avani-Reddy-Logo.webp" // Path to your image in the public folder
//           alt="Dr.Avani Reddy"
//           width={500} // Specify the width of the image
//           height={300} // Specify the height of the image
//         />

//         <div className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-sm w-full">
//           <Heart className="mx-auto text-green-500 w-24 h-24 mb-4" />
//           <h2 className="text-3xl font-bold text-blue-800 mb-4">
//             Appointment Received!
//           </h2>
//           <div className="space-y-2 text-gray-700 mb-6">
//             <p>Name: {submittedData?.name || "N/A"}</p>
//             <p>Location: {submittedData?.location || "N/A"}</p>
//             <p>Service: {submittedData?.service || "N/A"}</p>
//             <p>
//               Date:
//               {submittedData?.date
//                 ? new Date(submittedData.date).toLocaleDateString("en-GB") // 'en-GB' gives DD/MM/YYYY format
//                 : "N/A"}
//             </p>
//             <p>Time: {submittedData?.time || "N/A"}</p>
//           </div>

//           <button
//             onClick={() => {
//               setSubmitted(false);
//               reset();
//             }}
//             className="w-full bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
//           >
//             Book Another Appointment
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col md:flex-row md:items-center md:justify-center p-4 gap-2">
//       <ToastContainer />
//       <Image
//         src="/Dr-Avani-Reddy-Logo.webp" // Path to your image in the public folder
//         alt="Dr.Avani Reddy"
//         width={500} // Specify the width of the image
//         height={300} // Specify the height of the image
//       />
//       <div className="bg-white shadow-2xl rounded-2xl p-6 max-w-md w-full">
//         <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">
//           Book Your Appointment
//         </h1>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           {/* Name Input */}
//           <Controller
//             name="name"
//             control={control}
//             render={({ field }) => (
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
//                 <input
//                   {...field}
//                   type="text"
//                   placeholder="Full Name"
//                   className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black"
//                 />
//                 {errors.name && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.name.message}
//                   </p>
//                 )}
//               </div>
//             )}
//           />

//           {/* Age Input */}
//           <Controller
//             name="age"
//             control={control}
//             render={({ field }) => (
//               <div className="relative">
//                 <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
//                 <input
//                   {...field}
//                   type="number"
//                   placeholder="Age"
//                   className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-black"
//                 />
//                 {errors.age && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.age.message}
//                   </p>
//                 )}
//               </div>
//             )}
//           />

//           {/* WhatsApp Input */}
//           <Controller
//             name="whatsapp"
//             control={control}
//             render={({ field }) => (
//               <div className="relative">
//                 <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
//                 <input
//                   {...field}
//                   type="tel"
//                   placeholder="WhatsApp Number"
//                   className="w-full pl-10 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-black"
//                 />
//                 {errors.whatsapp && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.whatsapp.message}
//                   </p>
//                 )}
//               </div>
//             )}
//           />

//           {/* Compact Calendar */}
//           {
//             <div className="bg-gray-50 rounded-lg p-4">
//               <div className="flex items-center justify-between mb-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     const newMonth = new Date(currentMonth);
//                     newMonth.setMonth(currentMonth.getMonth() - 1);
//                     setCurrentMonth(newMonth);
//                   }}
//                   className="text-blue-600 hover:bg-blue-100 p-1 rounded-full"
//                 >
//                   <ChevronLeft size={20} />
//                 </button>
//                 <span className="text-sm font-semibold text-black">
//                   {currentMonth.toLocaleString("default", { month: "long" })}{" "}
//                   {currentMonth.getFullYear()}
//                 </span>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     const newMonth = new Date(currentMonth);
//                     newMonth.setMonth(currentMonth.getMonth() + 1);
//                     setCurrentMonth(newMonth);
//                   }}
//                   className="text-blue-600 hover:bg-blue-100 p-1 rounded-full"
//                 >
//                   <ChevronRight size={20} />
//                 </button>
//               </div>

//               <div className="grid grid-cols-7 gap-1 text-center">
//                 {["S", "M", "T", "W", "Th", "F", "St"].map((day) => (
//                   <div key={day} className="text-xs text-black">
//                     {day}
//                   </div>
//                 ))}

//                 {generateCalendarDays().map((dayObj, index) => (
//                   <button
//                     key={index}
//                     type="button"
//                     onClick={() => {
//                       if (dayObj && !dayObj.disabled) {
//                         setValue("date", dayObj.date, { shouldValidate: true });
//                         setValue("time", "", { shouldValidate: true });
//                       }
//                     }}
//                     disabled={dayObj === null || (dayObj && dayObj.disabled)}
//                     className={`
//             text-xs p-1 rounded-full
//             ${dayObj === null ? "invisible" : ""}
//             ${
//               dayObj && dayObj.disabled
//                 ? "text-gray-300 cursor-not-allowed"
//                 : ""
//             }
//             ${
//               watchDate &&
//               dayObj &&
//               watchDate.toDateString() === dayObj.date.toDateString()
//                 ? "bg-blue-600 text-white"
//                 : "hover:bg-blue-100 text-black"
//             }
//           `}
//                   >
//                     {dayObj ? dayObj.day : ""}
//                   </button>
//                 ))}
//               </div>
//               {errors.date && (
//                 <p className="text-red-500 text-xs mt-1 text-center">
//                   {errors.date.message}
//                 </p>
//               )}
//             </div>
//           }

//           {/* Time Slot Selection */}
//           {watchDate && timeSlots.length > 0 && (
//             <div className="bg-gray-50 rounded-lg p-4">
//               <h3 className="text-sm font-semibold text-black mb-2">
//                 Available Time Slots
//               </h3>
//               <div className="grid grid-cols-3 gap-2">
//                 {timeSlots.map(({ time, ampm }) => (
//                   <button
//                     key={time}
//                     type="button"
//                     onClick={() =>
//                       setValue("time", time, { shouldValidate: true })
//                     }
//                     disabled={isSlotBooked(watchDate, time)}
//                     className={`text-xs p-2 rounded-lg border font-medium
//             ${
//               isSlotBooked(watchDate, time)
//                 ? "bg-red-300 text-black cursor-not-allowed"
//                 : watch("time") === time
//                 ? "bg-green-800 text-white border-green-600"
//                 : "bg-green-300 text-black border-gray-300 hover:bg-green-200 hover:text-black"
//             }`}
//                   >
//                     {ampm}
//                   </button>
//                 ))}
//               </div>
//               {errors.time && (
//                 <p className="text-red-500 text-xs mt-1 text-center">
//                   {errors.time.message}
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className={`w-full bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors ${
//               isSubmitting ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? "✔️ Booking..." : "Book Appointment"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default DrAvaniReddy;
