"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
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
import { getDoctorAppointments } from "@/actions/getAppointments";
import AppointmentLoadingSkeleton from "./AppointmentDashboardLoading";
import { useRouter } from "next/navigation";
import RescheduleModal from "./Reschedule";

type AppointmentStatus = "CONFIRMED" | "PENDING" | "CANCELLED" | "RESCHEDULED";

// Define the types for the related data
export interface Appointment {
  id: number;
  name: string;
  phoneNumber: string;
  location: string | null; // Updated to allow null
  date: string;
  doctor: string;
  time: string;
  treatment: string;
  status: AppointmentStatus;
}
interface AppointmentResponse {
  website: string;
  appointments: Appointment[];
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  CONFIRMED: "bg-green-200 text-cyan-800 hover:bg-green-400",
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-300",
  CANCELLED: "bg-red-200 text-red-800 hover:bg-red-300",
  RESCHEDULED: "bg-orange-300 text-black hover:bg-orange-400",
};

const AppointmentsDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const topRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [tdwebsite, setTdwebsite] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] =
    useState<boolean>(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data: AppointmentResponse = await getDoctorAppointments(1);
        setTdwebsite(data.website);
        setAppointments(data.appointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesSearch = appointment.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || appointment.status === filterStatus;
      const matchesLocation =
        filterLocation === "all" || appointment.location === filterLocation;
      const matchesDate =
        !filterDate ||
        new Date(appointment.date).toLocaleDateString("en-US") ===
          filterDate.toLocaleDateString("en-US");
      return matchesSearch && matchesStatus && matchesLocation && matchesDate;
    });
  }, [appointments, searchTerm, filterStatus, filterLocation, filterDate]);

  const getStatusBadge = (status: AppointmentStatus) => (
    <Badge className={STATUS_STYLES[status] || "bg-gray-100 text-gray-800"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );

  const clearDateFilter = (): void => setFilterDate(null);

  if (loading) {
    return (
      <div>
        <AppointmentLoadingSkeleton />
      </div>
    );
  }

  const handleAddAppointmentClick = (): void => {
    const targetWebsite = tdwebsite;
    if (targetWebsite) {
      router.push(targetWebsite);
    } else {
      console.error("Website URL is missing for this appointment.");
    }
  };

  const handleRescheduleClick = (id: number | null) => (): void => {
    setSelectedAppointmentId(id);
    setIsRescheduleModalOpen(true);
  };

  const handleCloseReschedule = (): void => {
    setIsRescheduleModalOpen(false);
    setSelectedAppointmentId(null);
  };

  return (
    <>
      <div
        ref={topRef}
        className="w-full p-4 space-y-4 transition-all duration-300 ease-in-out transform-gpu"
      >
        <div className="flex items-center justify-between gap-4 text-sm transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-4 transition-all duration-300 ease-in-out">
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
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
              </SelectContent>
            </Select>

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
                <SelectItem value="Financial District">
                  Financial District
                </SelectItem>
                <SelectItem value="Kukatpally">Kukatpally</SelectItem>
              </SelectContent>
            </Select>
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
                <TableHead className="text-xs">Phone</TableHead>
                <TableHead className="text-xs">Location</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Time</TableHead>
                <TableHead className="text-xs">Doctor</TableHead>
                <TableHead className="text-xs">Treatment</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
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
                    <TableCell>{appointment.phoneNumber}</TableCell>
                    <TableCell>{appointment.location}</TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.doctor}</TableCell>
                    <TableCell>{appointment.treatment}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 text-xs h-7 transition-all duration-300 hover:bg-gray-100"
                        >
                          Cancel
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
