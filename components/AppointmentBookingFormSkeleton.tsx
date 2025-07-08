"use client";
import React from "react";

const AppointmentBookingFormSkeleton = () => {
  return (
    <div>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes bounce {
          0%,
          20%,
          53%,
          80%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          40%,
          43% {
            transform: translate3d(0, -15px, 0);
          }
          70% {
            transform: translate3d(0, -8px, 0);
          }
          90% {
            transform: translate3d(0, -3px, 0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .spinner {
          animation: spin 2s linear infinite;
        }

        .pulse-animation {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .bounce-animation {
          animation: bounce 2s infinite;
        }

        .fade-in {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>

      <div className="flex flex-col items-center justify-center space-y-6 fade-in">
        {/* Main Spinner Container */}
        <div className="relative">
          {/* Outer Ring */}
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>

          {/* Spinning Ring */}
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-600 border-r-blue-500 rounded-full spinner"></div>

          {/* Inner Pulsing Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-blue-400 to-green-400 rounded-full pulse-animation"></div>

          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Loading...
          </h3>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full bounce-animation"></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full bounce-animation"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full bounce-animation"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 pulse-animation">
            Please wait while we prepare your form
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-300 rounded-full opacity-30 pulse-animation"></div>
        <div
          className="absolute top-1/3 right-1/4 w-3 h-3 bg-green-300 rounded-full opacity-40 pulse-animation"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full opacity-50 pulse-animation"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-green-400 rounded-full opacity-35 pulse-animation"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>
    </div>
  );
};

export default AppointmentBookingFormSkeleton;
