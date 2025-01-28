import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface EmailTemplateProps {
  PatientName: string;
  Age: string;
  Location: string;
  Date: string;
  Time: string;
  Service: string;
  PatientContact: string;
  appointmentId: number;
}

export const EmailTemplate = ({
  PatientName,
  Age,
  Location,
  Date,
  Time,
  Service,
  PatientContact,
  appointmentId,
}: EmailTemplateProps) => {
  return (
    <Html>
      <Head>
        <style>
          {`
            /* Reset quoted text styling in Gmail */
            .gmail-fix {
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
            }
          `}
        </style>
      </Head>
      <Preview>
        New Appointment Confirmation - Hematology & BMT Institute
      </Preview>
      <Body style={main}>
        {/* Add div with gmail-fix class */}
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

            <Heading style={heading}>New Appointment Booked</Heading>

            <Section style={section}>
              <Row>
                <Column>
                  <Text style={text}>
                    <strong>Patient:</strong> {PatientName}
                  </Text>
                  <Text style={text}>
                    <strong>Age:</strong> {Age}
                  </Text>
                  <Text style={text}>
                    <strong>Contact:</strong> {PatientContact}
                  </Text>
                </Column>
                <Column>
                  <Text style={text}>
                    <strong>Location:</strong> {Location}
                  </Text>
                  <Text style={text}>
                    <strong>Service:</strong> {Service}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section style={timeSection}>
              <Row>
                <Column>
                  <Text style={timeText}>
                    <strong>Date:</strong> {Date}
                  </Text>
                </Column>
                <Column>
                  <Text style={timeText}>
                    <strong>Time:</strong> {Time}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section style={buttonSection}>
              <Button
                href={`http://localhost:3000/appointment/confirm/${appointmentId}`}
                style={confirmButton}
              >
                CONFIRM
              </Button>
              <Button
                href={`http://localhost:3000/appointment/cancel/${appointmentId}`}
                style={cancelButton}
              >
                CANCEL
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
};

// Styles remain the same
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
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

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  marginBottom: "24px",
};

const section = {
  marginBottom: "24px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  margin: "12px 0",
};

const timeSection = {
  backgroundColor: "#f0f9ff",
  borderRadius: "4px",
  padding: "16px",
  marginBottom: "24px",
};

const timeText = {
  color: "#333",
  fontSize: "16px",
  margin: "0",
  textAlign: "center" as const,
};

const buttonSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const baseButton = {
  padding: "12px 24px",
  borderRadius: "4px",
  margin: "0 8px",
  color: "#fff",
  textDecoration: "none",
};

const confirmButton = {
  ...baseButton,
  backgroundColor: "#16a34a",
};

const cancelButton = {
  ...baseButton,
  backgroundColor: "#dc2626",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footer = {
  color: "#4b5563",
  fontSize: "16px",
  margin: "4px 0",
  textAlign: "center" as const,
};

const subFooter = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "4px 0",
  textAlign: "center" as const,
};

export default EmailTemplate;
