import NextAuth, { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./lib/db";
import { DoctorType } from "@prisma/client";

// User-facing type for login
type LoginType = "Individual" | "Clinic";

// Extend the built-in types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id?: string;
      contact?: string | null;
      type?: LoginType;
      clinicId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    contact?: string | null;
    type?: LoginType;
    clinicId?: string | null;
  }
}

// Extend JWT type
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    contact?: string | null;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    type?: LoginType;
    clinicId?: string | null;
  }
}

// Define Prisma model interfaces
interface PrismaDoctor {
  id: number;
  name: string | null;
  whatsapp: string | null;
  password: string | null;
  loginId: string | null;
  type: DoctorType;
  clinicId: number | null;
}

interface PrismaClinic {
  id: number;
  name: string;
  loginId: string | null;
  password: string | null;
  email: string | null;
  phone: string | null;
}

// Custom error class for authentication errors
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        type: {
          label: "Type",
          type: "text",
        },
        loginId: {
          label: "Login ID",
          type: "text",
          placeholder: "Enter your login ID",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials) {
        try {
          if (
            !credentials?.loginId ||
            !credentials?.password ||
            !credentials?.type
          ) {
            throw new AuthError("Missing required credentials");
          }

          // Normalize type input
          const loginType = credentials.type as LoginType;
          if (loginType === "Clinic") {
            // Handle clinic login
            const clinic = (await prisma.clinic.findFirst({
              where: {
                loginId: credentials.loginId,
              },
            })) as PrismaClinic | null;

            if (!clinic || clinic.password !== credentials.password) {
              throw new AuthError("Invalid clinic credentials");
            }

            return {
              id: clinic.id.toString(),
              name: clinic.name,
              email: clinic.email,
              contact: clinic.phone,
              type: "Clinic" as LoginType,
              clinicId: clinic.id.toString(),
            };
          } else {
            // Handle individual doctor login
            const doctor = (await prisma.doctor.findFirst({
              where: {
                loginId: credentials.loginId,
                type: "INDIVIDUAL" as DoctorType,
              },
            })) as PrismaDoctor | null;

            if (!doctor || doctor.password !== credentials.password) {
              throw new AuthError("Invalid doctor credentials");
            }

            return {
              id: doctor.id.toString(),
              name: doctor.name,
              email: null,
              contact: doctor.whatsapp,
              type: "Individual" as LoginType,
              clinicId: doctor.clinicId?.toString() || null,
            };
          }
        } catch (error) {
          if (error instanceof AuthError) {
            throw new Error(error.message);
          }
          console.error("Authentication error:", error);
          throw new Error("An unexpected error occurred during authentication");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === "signIn" && user) {
        token.id = user.id;
        token.contact = user.contact;
        token.type = user.type;
        token.clinicId = user.clinicId;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          contact: token.contact,
          type: token.type,
          clinicId: token.clinicId,
        },
      };
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
