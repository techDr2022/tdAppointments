import {
  getDoctorAppointments,
  getAllAppointments,
} from "@/actions/getAppointments";
import { auth } from "@/auth";
import AppointmentsDashboard from "@/components/AppointmentDashboard";
import RagasAppointmentsDashboard from "@/components/RagasClinicAppointments";
import AdminAppointmentsDashboard from "@/components/AdminAppointmentsDashboard";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminAppointments() {
  // Get the request headers to check if it's a middleware request

  try {
    // Authenticate
    const session = await auth();

    // Handle unauthenticated state

    // Handle missing user ID
    if (!session) {
      console.error("No user ID found in session");
      redirect("/api/admin-login");
    }

    // Safely parse the doctor ID
    const doctorId =
      typeof session.user.id === "string"
        ? parseInt(session.user.id, 10)
        : session.user.id;

    // Check if this is the special admin doctor (ID: 19)
    if (doctorId === 19) {
      // Fetch all appointments from all doctors
      try {
        const allAppointmentsData = await getAllAppointments();
        // Ensure doctors array is present
        const safeAppointmentsData = {
          ...allAppointmentsData,
          doctors: allAppointmentsData.doctors || [],
        };
        return (
          <AdminAppointmentsDashboard initialData={safeAppointmentsData} />
        );
      } catch (fetchError) {
        console.error("Error fetching all appointments:", fetchError);
        return <div>Error loading appointments. Please try again later.</div>;
      }
    }

    // For other doctors, proceed with the regular flow
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

    // Show "View All Appointments" button for clinic users
    const showAllAppointmentsButton = session.user.type === "Clinic";

    if (session.user.clinicId) {
      if (parseInt(session.user.clinicId) === 2) {
        const safeAppointmentsData = {
          ...appointmentsData,
          doctors: appointmentsData.doctors || [],
        };
        return (
          <>
            {showAllAppointmentsButton && (
              <div className="flex justify-end p-4">
                <Link href="/admin/all-appointments">
                  <Button className="bg-blue-900">View All Appointments</Button>
                </Link>
              </div>
            )}
            <RagasAppointmentsDashboard initialData={safeAppointmentsData} />
          </>
        );
      }
    }

    return (
      <>
        {showAllAppointmentsButton && (
          <div className="flex justify-end p-4">
            <Link href="/admin/all-appointments">
              <Button className="bg-blue-900">View All Appointments</Button>
            </Link>
          </div>
        )}
        <AppointmentsDashboard initialData={appointmentsData} />
      </>
    );
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
