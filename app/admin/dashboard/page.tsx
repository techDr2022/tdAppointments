import { auth } from "@/auth";
import Sidebar from "@/components/AdminSidebar";
import { redirect } from "next/navigation";

const AdminDashboard = async () => {
  const session = await auth();

  if (!session) {
    redirect("/admin-login");
  }
  return (
    <div>
      <Sidebar />
      {session.user.name}
      {session.user.id}
    </div>
  );
};

export default AdminDashboard;
