export enum DoctorType {
  INDIVIDUAL = "INDIVIDUAL",
  CLINIC_AFFILIATED = "CLINIC_AFFILIATED",
}

export interface Clinic {
  id: number;
  loginId?: string | null;
  password?: string | null;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  doctors: Doctor[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: number;
  loginId?: string | null;
  password?: string | null;
  tdWebsite?: string | null;
  name: string;
  website: string;
  timings?: Record<string, string[]> | null;
  whatsapp?: string | null;
  sid_doctor?: string | null;
  sid_Ack?: string | null;
  sid_Pcf?: string | null;
  sid_resch?: string | null;
  sid_Pcn?: string | null;
  sid_Rm?: string | null;
  sid_Fd?: string | null;
  qualifications?: string | null;
  specialization?: string | null;
  registrationNo?: string | null;
  image_slug?: string | null; // Image slug for doctor's profile picture
  feedback_link?: string | null; // Link for patient feedback/reviews
  map_location?: string | null; // Google Maps or location link
  type: DoctorType;
  clinicId?: number | null;
  clinic?: Clinic | null;
  services: Service[];
  timeslots: Timeslot[];
  appointments: Appointment[];
  ehrRecords: EhrRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: number;
  name: string;
  age: string;
  email?: string | null;
  phone: string;
  sex?: string | null;
  relationship?: string | null; // Relationship when booking for others (e.g., Father, Mother, Friend)
  appointments: Appointment[];
  ehrRecords: EhrRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: number;
  date: Date;
  status: string;
  location?: string | null;
  reason?: string | null;
  doctorId: number;
  patientId: number;
  serviceId?: number | null;
  timeslotId: number;
  appointmentType?: string | null; // initial, followup, secondopinion, others
  customAppointmentType?: string | null; // Custom type when "others" is selected
  bookingType?: string | null; // myself, others
  relationship?: string | null;
  doctor: Doctor;
  patient: Patient;
  service?: Service | null;
  timeslot: Timeslot;
  ehrRecord?: EhrRecord | null;
  appointmentJob?: AppointmentJobs | null;
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
  type?: string | null;
  doctor: Doctor;
  appointments: Appointment[];
}

export interface AppointmentJobs {
  id: number;
  appointmentId: number;
  feedbackJobId?: string | null;
  reminderJobId?: string | null;
  createdAt: Date;
  appointment: Appointment;
}

export interface EhrRecord {
  id: number;
  appointmentId: number;
  doctorId: number;
  patientId: number;
  date: Date;
  weight?: string | null;
  temperature?: string | null;
  pulseRate?: string | null;
  bloodPressure?: string | null;
  respirationRate?: string | null;
  oxygenSaturation?: string | null;
  painScore?: string | null;
  chiefComplaints?: string | null;
  diagnosis?: string | null;
  investigation?: string | null;
  medicines?: Array<{ name: string; dosage: string; duration: string }> | null;
  appointment: Appointment;
  doctor: Doctor;
  patient: Patient;
  createdAt: Date;
  updatedAt: Date;
}
