"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppointmentBookingFormSkeleton from "@/components/AppointmentBookingFormSkeleton";
import Hematologybmt from "@/components/Hematologybmt";
import DrForms from "@/components/DrForms";
import { Result } from "postcss";

const BookingPageContent = () => {
  const searchParams = useSearchParams();
  const doctor = searchParams.get("doctor");

  const renderDoctorComponent = () => {
    switch (doctor) {
      case "Dr.S.K.Gupta":
        return <Hematologybmt />;
      case "Dr.AvaniReddy":
        return <DrForms doctorid={4} imageSrc="/Dr-Avani-Reddy-Logo.webp" />;
      case "Dr.AmanChandra":
        return <DrForms doctorid={8} imageSrc="/dr.aman-logo.webp" />;
      case "AuraClinic":
        return <DrForms doctorid={9} imageSrc="/aura-clinic-logo.webp"  starting={10} ending={16}/>;
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
