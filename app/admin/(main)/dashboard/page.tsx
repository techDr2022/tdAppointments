import { auth } from "@/auth";
import { redirect } from "next/navigation";

const AdminDashboard = async () => {
  const session = await auth();

  if (!session) {
    redirect("/admin-login");
  }
  return (
    <div>
      {
        "Hold tight, we're crafting something awesome! Give me a moment to add a catchy twist. 🚀 Stay tuned!"
      }
      {session.user.name}
      {session.user.id}
    </div>
  );
};

export default AdminDashboard;
