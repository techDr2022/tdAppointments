import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";

interface CancellationEmailProps {
  PatientName: string;
  Date: string;
  Time: string;
}

export const CancellationEmail: React.FC<CancellationEmailProps> = ({
  PatientName,
  Date,
  Time,
}) => (
  <Html>
    <Head>
      <style>
        {`
          .gmail-fix {
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }
        `}
      </style>
    </Head>
    <Preview>Your Appointment Cancellation - BMT Institute</Preview>
    <Body style={main}>
      <div className="gmail-fix">
        <Container style={container}>
          <Section style={imageContainer}>
            <Img
              src="https://hematologybmt.com/wp-content/uploads/2024/12/appointment.png"
              alt="BMT Institute Logo"
              width="580"
              style={logo}
            />
          </Section>

          <Section style={headerSection}>
            <Heading style={cancelHeading}>Appointment Cancelled</Heading>
            <Text style={cancelText}>
              Your appointment has been cancelled successfully.
            </Text>
          </Section>

          <Section style={contentSection}>
            <Text style={text}>Hello {PatientName},</Text>
            <Text style={text}>
              This email confirms that your appointment with Hematology & BMT
              Institute International has been cancelled.
            </Text>
          </Section>

          <Section style={detailsSection}>
            <Heading as="h3" style={subheading}>
              Cancelled Appointment Details:
            </Heading>
            <div style={timeContainer}>
              <Text style={timeText}>
                <strong>Date:</strong> {Date}
              </Text>
              <Text style={timeText}>
                <strong>Time:</strong> {Time}
              </Text>
            </div>
          </Section>

          <Section style={rescheduleSection}>
            <Heading as="h3" style={rescheduleHeading}>
              Would you like to reschedule?
            </Heading>
            <Text style={rescheduleText}>
              To schedule a new appointment, please contact us at:
            </Text>
            <Text style={contactText}>
              <strong>Phone/WhatsApp:</strong>{" "}
              <Link href="tel:+919560188881" style={phoneLink}>
                +91 95601 88881
              </Link>
            </Text>
            <Text style={availabilityText}>
              Our team is available Monday to Saturday, 9:00 AM - 6:00 PM IST
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>Hematology & BMT Institute International</Text>
          <Text style={subFooter}>
            Advanced Bone Marrow Transplant Expertise
          </Text>
        </Container>
      </div>
    </Body>
  </Html>
);

// Styles (consistent with previous email templates)
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
};

const imageContainer = {
  padding: "0",
  margin: "0 auto",
  width: "100%",
  textAlign: "center" as const,
};

const logo = {
  width: "100%",
  maxWidth: "580px",
  height: "auto",
  display: "block",
  margin: "0 auto 24px",
};

const headerSection = {
  backgroundColor: "#FEE2E2",
  padding: "16px",
  borderRadius: "4px",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const cancelHeading = {
  color: "#B91C1C",
  fontSize: "20px",
  margin: "0 0 8px 0",
};

const cancelText = {
  color: "#B91C1C",
  margin: "0",
  fontSize: "14px",
};

const contentSection = {
  marginBottom: "24px",
};

const text = {
  color: "#4B5563",
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "12px",
};

const detailsSection = {
  backgroundColor: "#F3F4F6",
  padding: "24px",
  borderRadius: "4px",
  marginBottom: "24px",
};

const subheading = {
  fontSize: "16px",
  lineHeight: "20px",
  fontWeight: "bold",
  marginBottom: "12px",
  color: "#374151",
};

const timeContainer = {
  display: "flex",
  justifyContent: "space-around",
};

const timeText = {
  color: "#4B5563",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 8px",
};

const rescheduleSection = {
  backgroundColor: "#EFF6FF",
  padding: "24px",
  borderRadius: "4px",
  marginBottom: "24px",
};

const rescheduleHeading = {
  color: "#1E40AF",
  fontSize: "16px",
  marginBottom: "12px",
};

const rescheduleText = {
  color: "#4B5563",
  fontSize: "14px",
  marginBottom: "12px",
};

const contactText = {
  color: "#4B5563",
  fontSize: "14px",
  marginBottom: "8px",
};

const phoneLink = {
  color: "#1D4ED8",
  textDecoration: "none",
};

const availabilityText = {
  color: "#6B7280",
  fontSize: "12px",
  marginTop: "8px",
};

const hr = {
  borderColor: "#E5E7EB",
  margin: "24px 0",
};

const footer = {
  color: "#4B5563",
  fontSize: "16px",
  textAlign: "center" as const,
  margin: "4px 0",
};

const subFooter = {
  color: "#6B7280",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "4px 0",
};

export default CancellationEmail;
