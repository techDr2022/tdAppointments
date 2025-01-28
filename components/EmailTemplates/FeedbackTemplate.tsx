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

interface FeedbackEmailProps {
  PatientName: string;
  GoogleReviewLink: string;
}

export const FeedbackEmail: React.FC<FeedbackEmailProps> = ({
  PatientName,
  GoogleReviewLink,
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
    <Preview>How was your experience with Hematology & BMT Institute?</Preview>
    <Body style={main}>
      <div className="gmail-fix">
        <Container style={container}>
          <Section style={imageContainer}>
            <Img
              src="https://hematologybmt.com/wp-content/uploads/2024/12/feedback.png"
              alt="BMT Institute Logo"
              width="580"
              style={logo}
            />
          </Section>

          <Section style={headerSection}>
            <Heading style={feedbackHeading}>How was your experience?</Heading>
            <Text style={feedbackSubtext}>
              Your feedback helps us serve you better!
            </Text>
          </Section>

          <Section style={contentSection}>
            <Text style={text}>Dear {PatientName},</Text>
            <Text style={text}>
              Thank you for choosing Hematology & BMT Institute International.
              We hope you had a positive experience with us. Your feedback is
              invaluable in helping us improve our services.
            </Text>
          </Section>

          <Section style={reviewSection}>
            <Section style={starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text key={star} style={starStyle}>
                  ★
                </Text>
              ))}
            </Section>

            <Heading style={reviewHeading}>
              Share Your Experience on Google
            </Heading>

            <Text style={reviewText}>
              Your review helps other patients make informed decisions about
              their healthcare.
            </Text>

            <Section style={buttonContainer}>
              <Link href={GoogleReviewLink} style={reviewButton}>
                Write a Review on Google
              </Link>
            </Section>
          </Section>

          <Section style={noteSection}>
            <Heading as="h4" style={notesHeading}>
              Why Your Review Matters:
            </Heading>
            <Text style={noteText}>
              • Helps us understand your experience
              <br />• Assists other patients in making informed decisions
              <br />• Enables us to continuously improve our services
              <br />• Helps us maintain high standards of care
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>Hematology & BMT Institute International</Text>
          <Text style={subFooter}>
            Advanced Bone Marrow Transplant Expertise
          </Text>

          <Text style={contactNote}>
            If you experienced any issues during your visit, please contact us
            directly at +91 95601 88881
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
  backgroundColor: "#EFF6FF",
  padding: "16px",
  borderRadius: "4px",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const feedbackHeading = {
  color: "#1E40AF",
  fontSize: "20px",
  margin: "0 0 8px 0",
};

const feedbackSubtext = {
  color: "#1E3A8A",
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

const reviewSection = {
  backgroundColor: "#F3F4F6",
  padding: "24px",
  borderRadius: "4px",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const starContainer = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "16px",
};

const starStyle = {
  color: "#FBBF24",
  fontSize: "24px",
  margin: "0 4px",
};

const reviewHeading = {
  color: "#1E40AF",
  fontSize: "18px",
  marginBottom: "12px",
};

const reviewText = {
  color: "#4B5563",
  fontSize: "14px",
  marginBottom: "16px",
};

const buttonContainer = {
  textAlign: "center" as const,
};

const reviewButton = {
  backgroundColor: "#2563EB",
  color: "white",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "500",
};

const noteSection = {
  backgroundColor: "#F9FAFB",
  padding: "24px",
  borderRadius: "4px",
  marginBottom: "24px",
};

const notesHeading = {
  color: "#374151",
  fontSize: "16px",
  marginBottom: "12px",
};

const noteText = {
  color: "#4B5563",
  fontSize: "14px",
  lineHeight: "1.5",
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

const contactNote = {
  color: "#6B7280",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "12px",
};

export default FeedbackEmail;
