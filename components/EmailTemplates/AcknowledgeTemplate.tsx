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
} from "@react-email/components";

interface AcknowledgmentTemplateProps {
  PatientName: string;
  Date: string;
  Time: string;
  Service: string;
  PatientContact: string;
  Location: string;
}

export const AcknowledgmentTemplate = ({
  PatientName,
  Date,
  Time,
  Service,
  PatientContact,
  Location,
}: AcknowledgmentTemplateProps) => {
  return (
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
      <Preview>Thank You for Your Appointment Request - BMT Institute</Preview>
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
              <Heading style={heading}>
                Thank You for Your Appointment Request
              </Heading>
              <Text style={text}>Hello {PatientName},</Text>
              <Text style={text}>
                We have received your appointment request and it is currently
                pending confirmation. Our team will review it shortly.
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
                  </Text>
                </div>
                <div style={gridColumn}>
                  <Text style={detailText}>
                    <strong>Service:</strong> {Service}
                  </Text>
                  <Text style={detailText}>
                    <strong>Status:</strong>{" "}
                    <span style={statusPending}>Pending</span>
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
                Please keep your WhatsApp ({PatientContact}) available for
                updates regarding your appointment confirmation. Our team will
                contact you shortly.
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
};

// Styles
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

const statusPending = {
  color: "#D97706",
  fontWeight: "500",
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

export default AcknowledgmentTemplate;
