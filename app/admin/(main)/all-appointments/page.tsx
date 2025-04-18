import { getAllAppointments } from "@/actions/getAppointments";
import { auth } from "@/auth";
import AdminAppointmentsDashboard from "@/components/AdminAppointmentsDashboard";
import { redirect } from "next/navigation";

export default async function AllAppointmentsPage() {
  try {
    // Authenticate
    const session = await auth();

    // Handle unauthenticated state
    if (!session) {
      console.error("No user found in session");
      redirect("/api/admin-login");
    }

    // Only allow access to admin users
    if (session.user.type !== "Clinic") {
      redirect("/admin/appointments");
    }

    // Fetch all appointments
    let appointmentsData;
    try {
      appointmentsData = await getAllAppointments();
    } catch (fetchError) {
      console.error("Error fetching appointments:", fetchError);
      return <div>Error loading appointments. Please try again later.</div>;
    }

    // Validate appointments data
    if (!appointmentsData) {
      return <div>No appointments found</div>;
    }

    // Ensure doctors array is always present
    const safeAppointmentsData = {
      ...appointmentsData,
      doctors: appointmentsData.doctors || [],
    };

    return <AdminAppointmentsDashboard initialData={safeAppointmentsData} />;
  } catch (error) {
    // Log the full error for debugging
    console.error("AllAppointmentsPage Error:", error);

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
