import React, { useState } from "react";
import Image from "next/image";
import { sendMessageContact } from "@/actions/ContactService";

// TechDr - Professional Appointment Booking SaaS Service
// Contact form for businesses interested in WhatsApp-integrated appointment booking solutions
const AppointmentBookingFormSkeleton: React.FC = () => {
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

  // Handle form submission for SaaS service inquiry
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await sendMessageContact("+918499005006", form);

      if (result.success) {
        alert(
          "Thank you for your interest! Our team will contact you within 24 hours to discuss your appointment booking solution."
        );
        // Reset form
        setForm({
          businessName: "",
          contactPerson: "",
          phone: "",
          email: "",
          businessType: "",
          preferredCallTime: "",
          requirements: "",
        });
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

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen flex items-center justify-center p-2">
      <div
        className="bg-white shadow-2xl rounded-xl max-w-md w-full max-h-screen overflow-y-auto [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-blue-400 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-500"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#f1f1f1 #f1f1f1" }}
      >
        <div className="bg-gradient-to-r from-white-500 to-blue-600 p-4 pb-2 text-white relative">
          {/* Header */}
          <div className="text-center -mx-4">
            <div className="flex justify-center -mt-2 -mb-2">
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
              WhatsApp Integration for Your Business
            </p>
          </div>
        </div>

        <div className="p-4">
          {/* Service Benefits */}
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Business name"
                  value={form.businessName}
                  onChange={(e) =>
                    setForm({ ...form, businessName: e.target.value })
                  }
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Your name"
                  value={form.contactPerson}
                  onChange={(e) =>
                    setForm({ ...form, contactPerson: e.target.value })
                  }
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="+1 555-1234"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="email@business.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={form.businessType}
                onChange={(e) =>
                  setForm({ ...form, businessType: e.target.value })
                }
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
                Preferred Call Time
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={form.preferredCallTime}
                onChange={(e) =>
                  setForm({ ...form, preferredCallTime: e.target.value })
                }
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-gray-700 text-xs font-medium mb-1">
                Requirements
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                placeholder="Your appointment booking needs..."
                value={form.requirements}
                onChange={(e) =>
                  setForm({ ...form, requirements: e.target.value })
                }
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
                    Processing...
                  </span>
                ) : (
                  "Schedule Free Consultation"
                )}
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="text-center pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                🔒 Secure • 📞 Free Demo • ⚡ Quick Setup
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBookingFormSkeleton;
