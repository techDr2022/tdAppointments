"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppointmentBookingFormSkeleton from "@/components/AppointmentBookingFormSkeleton";
import Hematologybmt from "@/components/Hematologybmt";
import DrForms from "@/components/DrForms";

const BookingPageContent = () => {
  const searchParams = useSearchParams();
  const doctor = searchParams.get("doctor");

  const renderDoctorComponent = () => {
    switch (doctor) {
      case "Dr.S.K.Gupta":
        return <Hematologybmt />;
      case "Dr.AvaniReddy":
        return (
          <DrForms
            doctorid={4}
            imageSrc="/Dr-Avani-Reddy-Logo.webp"
            starting="10:00"
            ending="21:00"
          />
        );
      case "Dr.AmanChandra":
        return (
          <DrForms
            doctorid={8}
            imageSrc="/dr.aman-logo.webp"
            starting="10:00"
            ending="21:00"
          />
        );
      case "AuraClinic":
        return (
          <DrForms
            doctorid={9}
            imageSrc="/aura-clinic-logo.webp"
            starting="10:00"
            ending="16:00"
          />
        );
      case "DivyaSkinClinic":
        return (
          <DrForms
            doctorid={10}
            imageSrc="/logo-divyaSkin.png"
            starting="16:30"
            ending="20:30"
          />
        );
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
