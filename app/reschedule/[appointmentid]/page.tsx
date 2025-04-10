"use client";
import RescheduleDynamic from "@/components/RescheduleDynamic";
import { useParams } from "next/navigation";

export default function ReschedulePage() {
  const { appointmentid } = useParams();
  console.log(appointmentid);
  return <RescheduleDynamic appointmentId={Number(appointmentid)} />;
}
