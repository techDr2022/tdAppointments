const AppointmentBookingFormSkeleton: React.FC = () => {
  return (
    <div className="bg-white shadow-md rounded-lg max-w-lg mx-auto overflow-hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 sm:px-6">
      <div className="p-8">
        {/* Header Skeleton */}
        <div className="animate-pulse mb-6">
          <div className="h-8 text-2xl md:text-3xl rounded text-blue-800 w-full">
            Book Your Appointment
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="space-y-4">
          {/* Name Input Skeleton */}
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>

          {/* Phone Input Skeleton */}
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>

          {/* Date Picker Skeleton */}
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>

          {/* Time Slot Skeleton */}
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>

          {/* Submit Button Skeleton */}
          <div className="pt-4">
            <div className="h-10 bg-gray-300 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBookingFormSkeleton;
