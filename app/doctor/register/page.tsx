import DoctorRegistrationForm from "@/components/DoctorRegistrationForm";
import Image from "next/image";

const DoctorRegistration = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-200 to-blue-400 flex flex-col md:flex-row md:items-center lg:justify-center z-50 p-4 md:pl-20 gap-4">
      <div className="md:max-w-md">
        <Image
          src={"/techdr logo.png"}
          width={400}
          height={200}
          alt="Techdr logo"
          priority
        />
        <div className="mt-4 text-blue-900 hidden md:block">
          <h2 className="text-2xl font-bold mb-2">
            Join Our Healthcare Network
          </h2>
          <p className="text-lg">
            Register today and streamline your appointment management with our
            advanced platform.
          </p>
        </div>
      </div>

      <DoctorRegistrationForm />
    </div>
  );
};

export default DoctorRegistration;
