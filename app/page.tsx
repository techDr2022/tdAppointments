"use client";
import { useSearchParams } from "next/navigation";
import AppointmentBookingFormSkeleton from "@/components/AppointmentBookingFormSkeleton";
import Hematologybmt from "@/components/Hematologybmt";

const BookingPage = () => {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctor");

  const renderDoctorComponent = () => {
    switch (doctorId) {
      case "Dr.S.K.Gupta":
        return <Hematologybmt />;
      default:
        return <AppointmentBookingFormSkeleton />;
    }
  };

  return <div>{renderDoctorComponent()}</div>;
};

export default BookingPage;
