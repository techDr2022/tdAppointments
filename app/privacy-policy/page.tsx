import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | TechDr",
  description: "Privacy Policy for TechDr appointment booking platform",
};

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Privacy Policy
            </h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              Thank you for choosing TechDr for your appointment booking and
              business consultation needs. Your privacy is important to us. This
              Privacy Policy explains how we collect, use, store, and protect
              your information when you use our website, services, and related
              features.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-700 mb-4">
                We collect the following types of information:
              </p>

              <div className="ml-4">
                <h3 className="text-xl font-medium text-gray-800 mb-3">
                  a. Personal Information
                </h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>
                    <strong>For Patients/Users:</strong> Name, age, phone
                    number, email address, gender, relationship (if booking for
                    others), and appointment details.
                  </li>
                  <li>
                    <strong>For Doctors/Clinics:</strong> Name, contact details,
                    professional information, clinic details, and medical
                    registration numbers.
                  </li>
                  <li>
                    <strong>For Business Inquiries:</strong> Business name,
                    contact person, phone number, email, business type,
                    preferred call time, and requirements.
                  </li>
                </ul>

                <h3 className="text-xl font-medium text-gray-800 mb-3">
                  b. Appointment & Service Data
                </h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>
                    Appointment dates, times, locations, and services requested
                  </li>
                  <li>
                    Medical records and EHR data (for healthcare providers)
                  </li>
                  <li>Communication history and preferences</li>
                  <li>Feedback and reviews</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-800 mb-3">
                  c. Technical Data
                </h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>Device information, browser type, and IP address</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and tracking technologies</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Schedule, manage, confirm, and reschedule appointments</li>
                <li>
                  Send notifications, reminders, and confirmations via WhatsApp,
                  SMS, or email
                </li>
                <li>
                  Facilitate communication between patients and healthcare
                  providers
                </li>
                <li>
                  Respond to business inquiries and provide requested services
                </li>
                <li>Process payments and manage billing</li>
                <li>Maintain electronic health records (where applicable)</li>
                <li>
                  Improve our services, website functionality, and user
                  experience
                </li>
                <li>Comply with legal obligations and protect our rights</li>
                <li>Send feedback requests and collect reviews</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. How We Share Your Information
              </h2>
              <p className="text-gray-700 mb-4">
                We do <strong>not</strong> sell your personal information. We
                may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>
                  <strong>Service Providers:</strong> Such as Twilio (for
                  WhatsApp/SMS messaging), Resend (for email), Prisma/PostgreSQL
                  (for data storage), and cloud hosting providers, only as
                  necessary to deliver our services
                </li>
                <li>
                  <strong>Healthcare Providers:</strong> Doctors, clinics, and
                  medical staff involved in your appointment or care
                </li>
                <li>
                  <strong>Business Partners:</strong> Authorized clinic networks
                  and affiliated healthcare providers
                </li>
                <li>
                  <strong>Legal Authorities:</strong> If required by law, court
                  order, or to protect our rights and users
                </li>
                <li>
                  <strong>Emergency Situations:</strong> To protect health and
                  safety when necessary
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Data Security
              </h2>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your
                data, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure database storage with access controls</li>
                <li>Regular security audits and monitoring</li>
                <li>Authentication and authorization protocols</li>
                <li>Secure API endpoints and data transmission</li>
              </ul>
              <p className="text-gray-700 mb-4">
                However, no method of transmission over the Internet is 100%
                secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Retention
              </h2>
              <p className="text-gray-700 mb-4">
                We retain your information only as long as necessary to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Provide our services and maintain appointment history</li>
                <li>
                  Comply with legal obligations and healthcare regulations
                </li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Maintain electronic health records as required by law</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Medical records may be retained for longer periods as required
                by healthcare regulations and professional standards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Your Rights
              </h2>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Access, update, or delete your personal information</li>
                <li>Object to or restrict certain processing</li>
                <li>Withdraw consent at any time (where applicable)</li>
                <li>Request data portability</li>
                <li>File a complaint with supervisory authorities</li>
                <li>Opt-out of marketing communications</li>
              </ul>
              <p className="text-gray-700 mb-4">
                To exercise your rights, please contact us at{" "}
                <a
                  href="mailto:contact@techdr.in"
                  className="text-blue-600 hover:text-blue-800"
                >
                  contact@techdr.in
                </a>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Cookies & Tracking
              </h2>
              <p className="text-gray-700 mb-4">
                We may use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Enhance your experience and remember your preferences</li>
                <li>Analyze usage patterns and improve our services</li>
                <li>Provide personalized content and recommendations</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings, though
                this may affect some functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Third-Party Services
              </h2>
              <p className="text-gray-700 mb-4">
                Our platform integrates with third-party services including:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>
                  <strong>Twilio:</strong> For WhatsApp and SMS messaging
                </li>
                <li>
                  <strong>Resend:</strong> For email communications
                </li>
                <li>
                  <strong>Google Maps:</strong> For location services
                </li>
                <li>
                  <strong>Payment Processors:</strong> For transaction
                  processing
                </li>
              </ul>
              <p className="text-gray-700 mb-4">
                These services have their own privacy policies. We are not
                responsible for their privacy practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Healthcare Data Protection
              </h2>
              <p className="text-gray-700 mb-4">
                For healthcare-related services, we comply with applicable
                healthcare privacy regulations including:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>
                  HIPAA (Health Insurance Portability and Accountability Act)
                  where applicable
                </li>
                <li>Local healthcare privacy laws and regulations</li>
                <li>Medical professional standards and guidelines</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Children's Privacy
              </h2>
              <p className="text-gray-700 mb-4">
                Our services are not intended for children under 16. We do not
                knowingly collect personal information from children under 16.
                If we become aware that we have collected such information, we
                will take steps to delete it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. International Data Transfers
              </h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in
                countries other than your own. We ensure appropriate safeguards
                are in place to protect your data during such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Changes to This Policy
              </h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. Changes
                will be posted on this page with an updated effective date. We
                encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Contact Us
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions or concerns about this Privacy Policy
                or your data, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:info@techdr.in"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    info@techdr.in
                  </a>
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Contact:</strong>{" "}
                  <a
                    href="mailto:contact@techdr.in"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    contact@techdr.in
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong>WhatsApp:</strong>{" "}
                  <a
                    href="https://wa.me/919542218454"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    +919542218454
                  </a>
                </p>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-center text-gray-600 font-medium">
                By using our services, you agree to this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
