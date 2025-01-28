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
  Button,
} from "@react-email/components";

interface ConfirmationEmailProps {
  PatientName: string;
  Date: string;
  Time: string;
  Service: string;
  PatientContact: string;
  Location: string;
  GoogleMapsLink: string;
}

export const ConfirmationEmail: React.FC<ConfirmationEmailProps> = ({
  PatientName,
  Date,
  Time,
  Service,
  PatientContact,
  Location,
  GoogleMapsLink,
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
    <Preview>
      Your Appointment Confirmation from Hematology & BMT Institute
      International
    </Preview>
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
            <Heading style={heading}>Appointment Confirmed!</Heading>
            <Text style={text}>Hello {PatientName},</Text>
            <Text style={text}>
              {
                "We're pleased to confirm your appointment with Hematology & BMT Institute International. Please review the details below and save them for your reference."
              }
            </Text>
          </Section>

          <Section style={detailsSection}>
            <Heading as="h3" style={subheading}>
              Appointment Details:
            </Heading>

            <div style={gridContainer}>
              <div style={gridColumn}>
                <Text style={detailText}>
                  <strong>Name:</strong> {PatientName}
                </Text>
                <Text style={detailText}>
                  <strong>Contact:</strong> {PatientContact}
                </Text>
                <Text style={detailText}>
                  <strong>Location:</strong> {Location}
                  <Link href={GoogleMapsLink} style={googleMapsLink}>
                    View on Google Maps →
                  </Link>
                </Text>
              </div>
              <div style={gridColumn}>
                <Text style={detailText}>
                  <strong>Service:</strong> {Service}
                </Text>
                <Text style={detailText}>
                  <strong>Status:</strong>{" "}
                  <span style={statusConfirmed}>Confirmed</span>
                </Text>
              </div>
            </div>

            <div style={timeContainer}>
              <Text style={timeText}>
                <strong>Date:</strong> {Date}
              </Text>
              <Text style={timeText}>
                <strong>Time:</strong> {Time}
              </Text>
            </div>
          </Section>

          <Section style={noteSection}>
            <Text style={noteText}>
              Important Notes:
              <br />• Please arrive 15 minutes before your scheduled appointment
              time
              <br />• Bring any relevant medical records or test results
              <br />• If you need to reschedule, please contact us at least 24
              hours in advance
              <br />• Keep your WhatsApp ({PatientContact}) available for any
              updates
            </Text>
          </Section>

          <Section style={buttonSection}>
            <Button href="#" style={rescheduleButton}>
              NEED TO RESCHEDULE?
            </Button>
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

// Styles (matching the Acknowledgment Template's style)
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
  marginBottom: "24px",
};

const heading = {
  fontSize: "20px",
  lineHeight: "24px",
  fontWeight: "bold",
  marginBottom: "16px",
};

const subheading = {
  fontSize: "16px",
  lineHeight: "20px",
  fontWeight: "bold",
  marginBottom: "12px",
};

const text = {
  color: "#4B5563",
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "12px",
};

const detailsSection = {
  backgroundColor: "#EFF6FF",
  padding: "24px",
  borderRadius: "4px",
  marginBottom: "24px",
};

const gridContainer = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "16px",
};

const gridColumn = {
  flexBasis: "48%",
};

const detailText = {
  color: "#4B5563",
  fontSize: "14px",
  lineHeight: "20px",
  marginBottom: "8px",
};

const statusConfirmed = {
  color: "#16A34A",
  fontWeight: "500",
};

const googleMapsLink = {
  color: "#2563EB",
  textDecoration: "none",
  display: "block",
  marginTop: "4px",
  fontSize: "12px",
};

const timeContainer = {
  display: "flex",
  justifyContent: "space-around",
  marginTop: "16px",
};

const timeText = {
  color: "#4B5563",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 8px",
};

const noteSection = {
  backgroundColor: "#F9FAFB",
  padding: "16px",
  borderRadius: "4px",
  marginBottom: "24px",
};

const noteText = {
  color: "#4B5563",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const rescheduleButton = {
  backgroundColor: "#DC2626",
  color: "white",
  padding: "12px 24px",
  borderRadius: "4px",
  textDecoration: "none",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "500",
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

export default ConfirmationEmail;
