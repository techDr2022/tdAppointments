"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppointmentLoadingSkeleton from "./AppointmentDashboardLoading";
import RescheduleModal from "./Reschedule";
import { SubmitHandlerAll } from "@/actions/SubmitHandlers";
import { AllAppointmentFormData } from "./DrForms";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type AppointmentStatus = "CONFIRMED" | "PENDING" | "CANCELLED" | "RESCHEDULED";

interface DoctorDetails {
  id: number;
  name: string;
}

export interface Appointment {
  id: number;
  name: string;
  age: string; // Add age field
  phoneNumber: string;
  location: string | null;
  date: string;
  doctor: string;
  time: string;
  treatment: string;
  status: AppointmentStatus;
}

interface AppointmentResponse {
  website: string;
  appointments: Appointment[];
  doctors: DoctorDetails[]; // Make doctors required for clinic response
}

interface AppointmentDashboardProps {
  initialData: AppointmentResponse;
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  CONFIRMED: "bg-green-200 text-cyan-800 hover:bg-green-400",
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-300",
  CANCELLED: "bg-red-200 text-red-800 hover:bg-red-300",
  RESCHEDULED: "bg-orange-300 text-black hover:bg-orange-400",
};

const AppointmentsDashboard = ({ initialData }: AppointmentDashboardProps) => {
  const topRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterDoctor, setFilterDoctor] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [appointments, setAppointments] = useState(initialData.appointments);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    name: "",
    age: "", // Add age field
    phoneNumber: "",
    date: new Date(),
    time: "",
    doctor: "",
    doctorId: 0, // Add doctorId field
    status: "CONFIRMED" as AppointmentStatus,
  });
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] =
    useState<boolean>(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(null);

  // Check if fields exist and have non-null values
  const hasField = useMemo(() => {
    return {
      location: appointments.some((app) => app.location !== null),
      doctor: appointments.some((app) => app.doctor !== null),
      treatment: appointments.some(
        (app) => app.treatment !== null && app.treatment !== "N/A"
      ),
      time: appointments.some((app) => app.time !== null),
      status: appointments.some((app) => app.status !== null),
    };
  }, [appointments]);

  // Get unique locations from appointments
  const uniqueLocations = useMemo(() => {
    if (!hasField.location) return [];
    const locations = new Set(
      appointments
        .map((app) => app.location)
        .filter((loc): loc is string => Boolean(loc))
    );
    return Array.from(locations);
  }, [appointments, hasField.location]);

  // Get unique doctors from appointments
  const uniqueDoctors = useMemo(() => {
    if (!initialData.doctors) return [];
    return initialData.doctors.map((doctor) => doctor.name);
  }, [initialData.doctors]);

  // Get unique statuses from appointments
  const uniqueStatuses = useMemo(() => {
    if (!hasField.status) return [];
    const statuses = new Set(
      appointments.map((app) => app.status).filter(Boolean)
    );
    return Array.from(statuses);
  }, [appointments, hasField.status]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesSearch = appointment.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        !hasField.status ||
        filterStatus === "all" ||
        appointment.status === filterStatus;
      const matchesLocation =
        !hasField.location ||
        filterLocation === "all" ||
        appointment.location === filterLocation;
      const matchesDoctor =
        !hasField.doctor ||
        filterDoctor === "all" ||
        appointment.doctor === filterDoctor;
      const matchesDate =
        !filterDate ||
        new Date(appointment.date).toLocaleDateString("en-US") ===
          filterDate.toLocaleDateString("en-US");
      return (
        matchesSearch &&
        matchesStatus &&
        matchesLocation &&
        matchesDoctor &&
        matchesDate
      );
    });
  }, [
    appointments,
    searchTerm,
    filterStatus,
    filterLocation,
    filterDoctor,
    filterDate,
    hasField,
  ]);

  const getStatusBadge = (status: AppointmentStatus) => (
    <Badge className={STATUS_STYLES[status] || "bg-gray-100 text-gray-800"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );

  const clearDateFilter = (): void => setFilterDate(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddAppointmentClick = () => {
    setIsAddingAppointment(true);
  };

  const handleSaveAppointment = async () => {
    try {
      // Format the appointment data for API
      const formData: AllAppointmentFormData = {
        name: newAppointment.name,
        whatsapp: newAppointment.phoneNumber,
        date: newAppointment.date,
        time: newAppointment.time,
        age: newAppointment.age,
      };

      const result = await SubmitHandlerAll(
        formData,
        "MANUAL",
        newAppointment.doctorId
      );

      if (result?.success) {
        const appointmentToAdd: Appointment = {
          id: appointments.length + 1,
          name: newAppointment.name,
          age: newAppointment.age,
          phoneNumber: newAppointment.phoneNumber,
          date: newAppointment.date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          time: new Date(`2000-01-01T${newAppointment.time}`)
            .toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
            .toLowerCase(),
          doctor: newAppointment.doctor,
          location: null,
          treatment: "N/A",
          status: "CONFIRMED" as AppointmentStatus,
        };

        // Add new appointment at the beginning of the array
        setAppointments([appointmentToAdd, ...appointments]);
        setIsAddingAppointment(false);

        // Reset the form
        setNewAppointment({
          name: "",
          age: "",
          phoneNumber: "",
          date: new Date(),
          time: "",
          doctor: "",
          doctorId: 0,
          status: "CONFIRMED",
        });

        toast.success("New Appointment Added successfully");
      } else {
        toast.error("Failed to add new appointment");
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Failed to add new appointment");
    }
  };

  const handleCancelAdd = () => {
    setIsAddingAppointment(false);
    setNewAppointment({
      name: "",
      age: "", // Reset age
      phoneNumber: "",
      date: new Date(),
      time: "",
      doctor: "",
      doctorId: 0, // Reset doctorId
      status: "CONFIRMED",
    });
  };

  const handleRescheduleClick = (id: number | null) => (): void => {
    setSelectedAppointmentId(id);
    setIsRescheduleModalOpen(true);
  };

  const handleCloseReschedule = (): void => {
    setIsRescheduleModalOpen(false);
    setSelectedAppointmentId(null);
  };

  if (!isClient) {
    return <AppointmentLoadingSkeleton />;
  }

  return (
    <>
      <div
        ref={topRef}
        className="w-full p-4 space-y-4 transition-all duration-300 ease-in-out transform-gpu"
      >
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <div className="flex items-center justify-between gap-4 text-sm transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-4 transition-all duration-300 ease-in-out">
            {hasField.status && uniqueStatuses.length > 0 && (
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
                defaultValue="all"
              >
                <SelectTrigger className="w-28 text-sm transition-all duration-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() +
                        status.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {hasField.location && uniqueLocations.length > 0 && (
              <Select
                value={filterLocation}
                onValueChange={setFilterLocation}
                defaultValue="all"
              >
                <SelectTrigger className="w-36 text-sm transition-all duration-300">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {hasField.doctor && uniqueDoctors.length > 0 && (
              <Select
                value={filterDoctor}
                onValueChange={setFilterDoctor}
                defaultValue="all"
              >
                <SelectTrigger className="w-36 text-sm transition-all duration-300">
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {uniqueDoctors.map((doctor) => (
                    <SelectItem key={doctor} value={doctor}>
                      {doctor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center gap-4 transition-all duration-300 ease-in-out">
            <DatePicker
              selected={filterDate}
              onChange={(date: Date | null) => setFilterDate(date)}
              placeholderText="Filter by Date"
              dateFormat="dd-MMM-yyyy"
              className="border rounded px-3 py-1.5 text-sm w-32 transition-all duration-300"
            />
            {filterDate && (
              <Button
                variant="outline"
                onClick={clearDateFilter}
                className="text-gray-600 text-sm h-8 transition-all duration-300"
              >
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4 transition-all duration-300 ease-in-out">
            <div className="relative transition-all duration-300">
              <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by Name"
                className="pl-8 text-sm h-8 w-48 transition-all duration-300"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>
            <Button
              variant="default"
              className="bg-blue-900 text-sm h-8 transition-all duration-300"
              onClick={handleAddAppointmentClick}
            >
              Add Appointment
            </Button>
          </div>
        </div>

        <div className="transition-all duration-300 ease-in-out overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="transition-all duration-300">
                <TableHead className="w-[30px]">
                  <input type="checkbox" className="rounded border-gray-300" />
                </TableHead>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Age</TableHead>
                <TableHead className="text-xs">Phone</TableHead>
                {hasField.location && (
                  <TableHead className="text-xs">Location</TableHead>
                )}
                <TableHead className="text-xs">Date</TableHead>
                {hasField.time && (
                  <TableHead className="text-xs">Time</TableHead>
                )}
                {hasField.doctor && (
                  <TableHead className="text-xs">Doctor</TableHead>
                )}
                {hasField.treatment && (
                  <TableHead className="text-xs">Treatment</TableHead>
                )}
                {hasField.status && (
                  <TableHead className="text-xs">Status</TableHead>
                )}
                <TableHead className="text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAddingAppointment && (
                <TableRow className="text-sm transition-all duration-300 hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      disabled
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newAppointment.name}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          name: e.target.value,
                        })
                      }
                      className="w-full text-sm"
                      placeholder="Enter name"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newAppointment.age}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          age: e.target.value,
                        })
                      }
                      className="w-full text-sm"
                      placeholder="Enter age"
                      type="number"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newAppointment.phoneNumber}
                      onChange={(e) =>
                        setNewAppointment({
                          ...newAppointment,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full text-sm"
                      placeholder="Enter phone"
                    />
                  </TableCell>
                  <TableCell>
                    <DatePicker
                      selected={newAppointment.date}
                      onChange={(date: Date | null) =>
                        setNewAppointment({
                          ...newAppointment,
                          date: date || new Date(),
                        })
                      }
                      className="w-full border rounded px-3 py-1 text-sm"
                      dateFormat="dd-MMM-yyyy"
                      minDate={new Date()}
                    />
                  </TableCell>
                  {hasField.time && (
                    <TableCell>
                      <Input
                        value={newAppointment.time}
                        onChange={(e) =>
                          setNewAppointment({
                            ...newAppointment,
                            time: e.target.value,
                          })
                        }
                        className="w-full text-sm"
                        placeholder="Enter time"
                        type="time"
                        step="900" // 15-minute intervals
                      />
                    </TableCell>
                  )}
                  {hasField.doctor && (
                    <TableCell>
                      <Select
                        value={newAppointment.doctor}
                        onValueChange={(value) => {
                          const selectedDoctor = initialData.doctors.find(
                            (d) => d.name === value
                          );
                          setNewAppointment({
                            ...newAppointment,
                            doctor: value,
                            doctorId: selectedDoctor?.id || 0,
                          });
                        }}
                      >
                        <SelectTrigger className="w-full text-sm">
                          <SelectValue placeholder="Select Doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {initialData.doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.name}>
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}
                  {hasField.status && (
                    <TableCell>{getStatusBadge("CONFIRMED")}</TableCell>
                  )}
                  <TableCell>
                    <div className="flex space-x-2 transition-all duration-300">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 text-white text-xs h-7"
                        onClick={handleSaveAppointment}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 text-xs h-7"
                        onClick={handleCancelAdd}
                      >
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <TableRow
                    key={appointment.id}
                    className="text-sm transition-all duration-300 hover:bg-gray-50"
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>{appointment.name}</TableCell>
                    <TableCell>{appointment.age}</TableCell>
                    <TableCell>{appointment.phoneNumber}</TableCell>
                    {hasField.location && (
                      <TableCell>{appointment.location}</TableCell>
                    )}
                    <TableCell>{appointment.date}</TableCell>
                    {hasField.time && <TableCell>{appointment.time}</TableCell>}
                    {hasField.doctor && (
                      <TableCell>{appointment.doctor}</TableCell>
                    )}
                    {hasField.treatment && appointment.treatment !== "N/A" && (
                      <TableCell>{appointment.treatment}</TableCell>
                    )}
                    {hasField.status && (
                      <TableCell>
                        {getStatusBadge(appointment.status)}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex space-x-2 transition-all duration-300">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 text-xs h-7 transition-all duration-300 hover:bg-gray-100"
                          onClick={handleRescheduleClick(appointment.id)}
                        >
                          Reschedule
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-4 text-sm">
                    No appointments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {isRescheduleModalOpen && (
        <RescheduleModal
          isOpen={isRescheduleModalOpen}
          onClose={handleCloseReschedule}
          appointmentId={selectedAppointmentId}
        />
      )}
    </>
  );
};

export default AppointmentsDashboard;
