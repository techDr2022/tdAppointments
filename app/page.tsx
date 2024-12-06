"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppointmentBookingFormSkeleton from "@/components/AppointmentBookingFormSkeleton";
import Hematologybmt from "@/components/Hematologybmt";

const BookingPageContent = () => {
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

const BookingPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  );
};

export default BookingPage;
