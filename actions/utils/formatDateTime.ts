// New utility function for date and time formatting
export function formatDateTime(startTime: Date) {
  const date = startTime.toISOString().split("T");
  const trimmedTime = date[1].slice(0, 5);
  const [hours, minutes] = trimmedTime.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
  const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;

  return {
    formattedDate: date[0],
    formattedTime,
  };
}
