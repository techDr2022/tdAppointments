import { getDoctorAppointments } from "@/actions/getAppointments";
import { auth } from "@/auth";
import AppointmentsDashboard from "@/components/AppointmentDashboard";
import RagasAppointmentsDashboard from "@/components/RagasClinicAppointments";
import { redirect } from "next/navigation";

export default async function AdminAppointments() {
  // Get the request headers to check if it's a middleware request

  try {
    // Authenticate
    const session = await auth();

    // Handle unauthenticated state

    // Handle missing user ID
    if (!session) {
      console.error("No user ID found in session");
      redirect("/admin-login");
    }

    // Safely parse the doctor ID
    const doctorId =
      typeof session.user.id === "string"
        ? parseInt(session.user.id, 10)
        : session.user.id;

    // Validate doctor ID

    // Fetch appointments with error handling
    let appointmentsData;
    try {
      if (doctorId && session.user.type)
        appointmentsData = await getDoctorAppointments(
          doctorId,
          session.user.type
        );
    } catch (fetchError) {
      console.error("Error fetching appointments:", fetchError);
      return <div>Error loading appointments. Please try again later.</div>;
    }

    // Validate appointments data
    if (!appointmentsData) {
      return <div>No appointments found</div>;
    }
    if (session.user.clinicId) {
      if (parseInt(session.user.clinicId) === 2) {
        return <RagasAppointmentsDashboard initialData={appointmentsData} />;
      }
    }

    return <AppointmentsDashboard initialData={appointmentsData} />;
  } catch (error) {
    // Log the full error for debugging
    console.error("AdminAppointments Error:", error);

    // If it's a redirect error, let Next.js handle it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    // For other errors, show a user-friendly message
    return (
      <div className="p-4 text-red-600">
        <h2 className="text-lg font-semibold">Error Loading Appointments</h2>
        <p>
          Please try refreshing the page or contact support if the issue
          persists.
        </p>
      </div>
    );
  }
}
