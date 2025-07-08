import React, { useState } from "react";
import Image from "next/image";
import { sendMessageContact } from "@/actions/ContactService";

// TechDr - Professional Appointment Booking SaaS Service
// Contact form for businesses interested in WhatsApp-integrated appointment booking solutions
const ServiceContactForm: React.FC = () => {
  const [form, setForm] = useState({
    businessName: "",
    contactPerson: "",
    phone: "",
    email: "",
    businessType: "",
    preferredCallTime: "",
    requirements: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [originalSubmission, setOriginalSubmission] = useState<any>(null);
  const [wasRescheduling, setWasRescheduling] = useState(false);

  // Handle form submission for SaaS service inquiry
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create form data with reschedule information
      const formData = {
        ...form,
        requestType: isRescheduling
          ? ("RESCHEDULE" as const)
          : ("NEW_CONSULTATION" as const),
        originalCallTime: isRescheduling
          ? originalSubmission?.preferredCallTime
          : undefined,
      };

      const result = await sendMessageContact("+918498851439", formData);

      if (result.success) {
        if (isRescheduling) {
          // Update the original submission with new time
          setOriginalSubmission({
            ...originalSubmission,
            preferredCallTime: form.preferredCallTime,
          });
          setWasRescheduling(true);
          setIsRescheduling(false);
        } else {
          // Store the original submission for potential rescheduling
          setOriginalSubmission(form);
          setWasRescheduling(false);
        }

        setShowSuccessModal(true);

        // Reset form if it's a new consultation
        if (!isRescheduling) {
          setForm({
            businessName: "",
            contactPerson: "",
            phone: "",
            email: "",
            businessType: "",
            preferredCallTime: "",
            requirements: "",
          });
        }
      } else {
        alert(
          "Sorry, there was an error sending your message. Please try again or contact us directly."
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        "Sorry, there was an error sending your message. Please try again or contact us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = () => {
    setShowSuccessModal(false);
    setIsRescheduling(true);

    // Restore the original form data but reset the preferred call time
    if (originalSubmission) {
      setForm({
        ...originalSubmission,
        preferredCallTime: "",
      });
    }
  };

  const handleCancelReschedule = () => {
    setIsRescheduling(false);
    // Reset form to empty state
    setForm({
      businessName: "",
      contactPerson: "",
      phone: "",
      email: "",
      businessType: "",
      preferredCallTime: "",
      requirements: "",
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen flex items-center justify-center p-2">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {wasRescheduling ? "Reschedule Request Sent!" : "Thank You!"}
            </h3>
            <p className="text-gray-600 mb-4">
              {wasRescheduling
                ? "Your reschedule request has been submitted. Our team will contact you to confirm the new time."
                : "Our team will contact you within 24 hours to discuss your appointment booking solution."}
            </p>
            <div className="flex flex-col gap-2">
              {!wasRescheduling && (
                <button
                  onClick={handleReschedule}
                  className="w-full bg-blue-100 text-blue-600 py-2 px-4 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  Reschedule Consultation
                </button>
              )}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setWasRescheduling(false);
                }}
                className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="bg-white shadow-2xl rounded-xl max-w-md w-full max-h-screen overflow-y-auto [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-blue-400 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-500"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#f1f1f1 #f1f1f1" }}
      >
        <div className="bg-gradient-to-r from-white-500 to-blue-600 p-4 pb-2 text-white relative">
          {/* Header */}
          <div className="text-center -mx-2">
            <div className="flex justify-center -mt-1 -mb-2">
              <Image
                src="/techdr logo.png"
                alt="TechDr Logo"
                width={200}
                height={80}
                className="h-24 w-auto object-contain"
                priority
              />
            </div>
            <p className="text-black text-xs mt-1">
              {isRescheduling
                ? "Reschedule Your Consultation"
                : "WhatsApp Integration for Your Business"}
            </p>
          </div>
        </div>

        <div className="p-4">
          {/* Reschedule Notice */}
          {isRescheduling && (
            <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">
                  Rescheduling Consultation
                </span>
              </div>
              <p className="text-xs text-blue-600">
                Update your preferred call time below. All other details remain
                the same.
              </p>
              {originalSubmission?.preferredCallTime && (
                <p className="text-xs text-gray-600 mt-1">
                  Previous time:{" "}
                  {new Date(
                    originalSubmission.preferredCallTime
                  ).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Service Benefits - Only show for new consultations */}
          {!isRescheduling && (
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">
                Key Features
              </h2>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 text-xs">WhatsApp</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 text-xs">Reminders</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 text-xs">Scheduling</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 text-xs">Analytics</span>
                </div>
              </div>
            </div>
          )}

          {/* Contact Form */}
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              {/* Business Name */}
              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                    isRescheduling ? "bg-gray-50" : ""
                  }`}
                  placeholder="Business name"
                  value={form.businessName}
                  onChange={(e) =>
                    setForm({ ...form, businessName: e.target.value })
                  }
                  disabled={isRescheduling}
                  required
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                    isRescheduling ? "bg-gray-50" : ""
                  }`}
                  placeholder="Your name"
                  value={form.contactPerson}
                  onChange={(e) =>
                    setForm({ ...form, contactPerson: e.target.value })
                  }
                  disabled={isRescheduling}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Phone Number */}
              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                    isRescheduling ? "bg-gray-50" : ""
                  }`}
                  placeholder="+1 555-1234"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  disabled={isRescheduling}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 text-xs font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                    isRescheduling ? "bg-gray-50" : ""
                  }`}
                  placeholder="email@business.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={isRescheduling}
                  required
                />
              </div>
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-gray-700 text-xs font-medium mb-1">
                Business Type *
              </label>
              <select
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                  isRescheduling ? "bg-gray-50" : ""
                }`}
                value={form.businessType}
                onChange={(e) =>
                  setForm({ ...form, businessType: e.target.value })
                }
                disabled={isRescheduling}
                required
              >
                <option value="">Select type</option>
                <option value="healthcare">Healthcare</option>
                <option value="beauty">Beauty & Wellness</option>
                <option value="dental">Dental</option>
                <option value="consulting">Consulting</option>
                <option value="fitness">Fitness</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Preferred Call Time */}
            <div>
              <label className="block text-gray-700 text-xs font-medium mb-1">
                {isRescheduling
                  ? "New Preferred Call Time *"
                  : "Preferred Call Time"}
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={form.preferredCallTime}
                onChange={(e) =>
                  setForm({ ...form, preferredCallTime: e.target.value })
                }
                required={isRescheduling}
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-gray-700 text-xs font-medium mb-1">
                Requirements
              </label>
              <textarea
                rows={3}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none ${
                  isRescheduling ? "bg-gray-50" : ""
                }`}
                placeholder="Your appointment booking needs..."
                value={form.requirements}
                onChange={(e) =>
                  setForm({ ...form, requirements: e.target.value })
                }
                disabled={isRescheduling}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isRescheduling ? "Rescheduling..." : "Processing..."}
                  </span>
                ) : isRescheduling ? (
                  "Confirm Reschedule"
                ) : (
                  "Schedule Free Consultation"
                )}
              </button>
            </div>

            {/* Cancel Reschedule Button */}
            {isRescheduling && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleCancelReschedule}
                  className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel Reschedule
                </button>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="text-center pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">
                🔒 Secure • 📞 Free Demo • ⚡ Quick Setup
              </p>
              <a
                href="/privacy-policy"
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceContactForm;
