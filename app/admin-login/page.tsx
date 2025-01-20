import AdminLoginForm from "@/components/AdminLoginForm";
import Image from "next/image";

const AdminLogin = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-200 to-blue-400 flex flex-col md:flex-row  md:items-center lg:justify-center z-50 p-4 md:pl-80 gap-4">
      <div>
        <Image
          src={"/techdr logo.png"}
          width={400}
          height={200}
          alt="Techdr logo"
        />
      </div>

      <AdminLoginForm />
    </div>
  );
};

export default AdminLogin;
