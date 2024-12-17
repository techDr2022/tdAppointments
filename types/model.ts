export interface Doctor {
  id: number;
  name: string;
  website: string;
  whatsapp?: string;
  sid_doctor?: string;
  sid_Ack?: string;
  sid_Pcf?: string;
  sid_Pcn?: string;
  sid_Rm?: string;
  sid_Fd?: string;
  services: Service[]; // One-to-many relation
  timeslots: Timeslot[]; // One-to-many relation
  appointments: Appointment[]; // One-to-many relation
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
