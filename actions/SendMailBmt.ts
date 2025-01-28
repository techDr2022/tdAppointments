import AcknowledgmentTemplate from "@/components/EmailTemplates/AcknowledgeTemplate";
import EmailTemplate from "@/components/EmailTemplates/BmtMailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
export const ResendEmail = process.env.RESEND_EMAIL;
export const BmtEmail = process.env.BMT_EMAIL;

interface SendMailBMTProps {
  patientName: string;
  age: string;
  location: string;
  date: string;
  time: string;
  service: string;
  patientContact: string;
  appointmentId: number;
  patientMail: string | null;
}

interface TemplateInputs {
  PatientName: string;
  PatientContact: string;
  Age: string;
  Date: string;
  Service: string;
  Location: string;
  appointmentId: number;
  Time: string;
}

export async function sendMailBmt({
  patientName,
  patientContact,
  location,
  age,
  date,
  time,
  service,
  appointmentId,
  patientMail,
}: SendMailBMTProps): Promise<{ success: boolean; error?: string }> {
  console.log("Received input data:", {
    patientName,
    patientContact,
    location,
    age,
    date,
    time,
    service,
    appointmentId,
    patientMail,
  });

  if (!patientMail) {
    console.error("Patient email is missing.");
    return { success: false, error: "Patient email is required" };
  }

  const templateInputs: TemplateInputs = {
    PatientName: patientName,
    PatientContact: patientContact,
    Age: age,
    Date: date,
    Service: service,
    Location: location,
    appointmentId,
    Time: time,
  };

  try {
    const { data, error } = await resend.emails.send({
      from: `${ResendEmail}`,
      to: [`${BmtEmail}`],
      subject: "New Appointment Request",
      react: EmailTemplate(templateInputs),
    });

    await resend.emails.send({
      from: `${ResendEmail}`,
      to: [patientMail],
      subject: "Appointment Request Received: Awaiting Confirmation",
      react: AcknowledgmentTemplate(templateInputs),
    });
    console.log("data:", data);
    console.log("error", error);
    if (error) {
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to send emails. Error details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
