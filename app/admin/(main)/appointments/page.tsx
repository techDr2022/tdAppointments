import { getDoctorAppointments } from "@/actions/getAppointments";
import { auth } from "@/auth";
import AppointmentsDashboard from "@/components/AppointmentDashboard";
import { redirect } from "next/navigation";

export default async function AdminAppointments() {
  try {
    const session = await auth();
    console.log("session", session);
    if (!session) {
      redirect("/admin-login");
    }

    if (!session.user.id) {
      return null;
    }

    const doctorId = parseInt(session.user.id);
    const appointmentsData = await getDoctorAppointments(doctorId);

    return <AppointmentsDashboard initialData={appointmentsData} />;
  } catch (error) {
    console.error("Error :", error);
    return <div>Failed to load appointments</div>;
  }
}
