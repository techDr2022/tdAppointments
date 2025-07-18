"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ServiceContactForm from "@/components/ServiceContactForm";
import Hematologybmt from "@/components/Hematologybmt";
import DrForms from "../components/DrForms";
import ClinicDrForms from "@/components/ClinicDoctorsForm";
import DrArunaEntForm from "@/components/DrArunaEntForm";
import AppointmentBookingFormSkeleton from "@/components/AppointmentBookingFormSkeleton";

const BookingPageContent = () => {
  const searchParams = useSearchParams();
  const doctor = searchParams.get("doctor");
  if (!doctor) {
    return <ServiceContactForm />;
  }

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
      case "OreneClinic":
        return (
          <DrForms
            doctorid={12}
            imageSrc="/orene-logo.webp"
            starting="17:00"
            ending="21:00"
          />
        );
      case "Dr.PrithviPerum":
        return (
          <DrForms
            doctorid={13}
            imageSrc="/Logo Mathrutwa.webp"
            starting="9:00"
            ending="21:00"
          />
        );

      case "ABSkinClinic":
        return (
          <DrForms
            doctorid={11}
            imageSrc="/logo Abskin.webp"
            starting="9:00"
            ending="21:00"
          />
        );
      case "SamanviClinic":
        return (
          <DrForms
            doctorid={14}
            imageSrc="/logo samanwiClinc.webp"
            starting="17:00"
            ending="21:00"
          />
        );
      case "Dr.Azadh":
        return (
          <DrForms
            doctorid={15}
            imageSrc="/Dr-aazadh-logo.webp"
            starting="9:00"
            ending="17:00"
          />
        );
      case "Dr.JagdishPusa":
        return (
          <DrForms
            doctorid={16}
            imageSrc="/drjadishpusalogo.png"
            starting="9:00"
            ending="21:00"
          />
        );
      case "avnifertility":
        return (
          <DrForms
            doctorid={17}
            imageSrc="/avnifertilitylogo.svg"
            starting="9:00"
            ending="21:00"
          />
        );
      case "drkirangastro":
        return (
          <DrForms
            doctorid={18}
            imageSrc="/kiran-logo.webp"
            starting="7:00"
            ending="21:00"
          />
        );
      case "ragasclinics":
        return <ClinicDrForms clinicId={1} />;

      case "Dr.Aruna":
        return <DrArunaEntForm />;
      case "Keyanclinic":
        return (
          <DrForms
            doctorid={30}
            imageSrc="/keyan-clinic-logo.png"
            starting="9:00"
            ending="21:00"
          />
        );
      case "EvolveClinic":
        return (
          <DrForms
            doctorid={31}
            imageSrc="/evolve-clinic-logo.webp"
            starting="9:00"
            ending="19:00"
          />
        );
      case "Drsrinivas":
        return (
          <DrForms
            doctorid={32}
            imageSrc="/srinivas-logo.webp"
            starting="17:00"
            ending="21:00"
          />
        );

      case "DrSrikanth":
        return (
          <DrForms
            doctorid={33}
            imageSrc="/srikanth-logo.webp"
            starting="11:00"
            ending="21:00"
          />
        );
      case " ":
        return (
          <DrForms
            doctorid={34}
            imageSrc="/jjhospital-logo.png"
            starting="9:00"
            ending="22:00"
          />
        );
      case "NeumedClinic":
        return <ClinicDrForms clinicId={4} />;
      case "Shreemayukha":
        return (
          <DrForms
            doctorid={36}
            imageSrc="/shreemayukha-logo.jpg"
            starting="9:00"
            ending="21:00"
          />
        );

      case "DrSameerakota":
        return (
          <DrForms
            doctorid={37}
            imageSrc="/sameerakota-logo.png"
            starting="15:00"
            ending="19:00"
          />
        );
      case "dentalexcellence":
        return (
          <DrForms
            doctorid={38}
            imageSrc="/dental-excellence-logo.png"
            starting="10:00"
            ending="21:00"
            locations={[
              {
                name: "Basheerbhag",
                doctors: [{ name: "Dr.Ashish Jain", id: 38 }],
              },
              {
                name: "Miyapur",
                doctors: [{ name: "Dr.Sri Priya", id: 39 }],
              },
            ]}
            blockedSlots={[{ start: "14:30", end: "16:00" }]}
          />
        );

      case "CurisClinic":
        return (
          <DrForms
            doctorid={40}
            imageSrc="/curis-clinic-logo.png"
            starting="18:00"
            ending="20:30"
          />
        );
      case "DrRakeshChava":
        return (
          <DrForms
            doctorid={41}
            starting="10:00"
            ending="19:00"
            imageSrc="/drrakeshchava-logo.webp"
          />
        );
      case "KindleClinics":
        return (
          <DrForms
            doctorid={47}
            starting="10:00"
            ending="20:00"
            imageSrc="/Kindle-logo.png"
          />
        );
      case "drsruthireddy":
        return (
          <DrForms
            doctorid={48}
            starting="10:00"
            ending="20:00"
            imageSrc="/DrSruthiReddy.jpg"
          />
        );

      default:
        return <ServiceContactForm />;
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
