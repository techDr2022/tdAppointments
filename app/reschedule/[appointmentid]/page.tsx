"use client";
import RescheduleDynamic from "@/components/RescheduleDynamic";
import { useParams } from "next/navigation";

export default function ReschedulePage() {
  const { appointmentid } = useParams();
  console.log("Appointment ID from URL:", appointmentid);

  // Validate that appointmentid is a valid number
  const parsedId = appointmentid
    ? parseInt(appointmentid.toString(), 10)
    : null;
  const isValidId = parsedId !== null && !isNaN(parsedId) && parsedId > 0;

  return <RescheduleDynamic appointmentId={isValidId ? parsedId : null} />;
}
