export interface Doctor {
  id: number;
  name: string;
  website: string;
  whatsapp?: string;
  services: Service[];
  timeslots: Timeslot[];
  appointments: Appointment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: number;
  name: string;
  age: string;
  phone: string;
  appointments: Appointment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: number;
  date: Date;
  status: string;
  location?: string | null;
  doctorId: number;
  patientId: number;
  serviceId: number | null; // Changed from optional to explicitly null
  timeslotId: number;
  doctor?: Doctor; // Made optional
  patient?: Patient; // Made optional
  service?: Service | null;
  timeslot?: Timeslot; // Made optional
  createdAt: Date;
  updatedAt: Date;
}
export interface Service {
  id: number;
  name: string;
  doctorId: number;
  doctor: Doctor;
  appointments: Appointment[];
}

export interface Timeslot {
  id: number;
  startTime: Date;
  doctorId: number;
  isAvailable: boolean;
  doctor: Doctor;
  appointments: Appointment[];
}
