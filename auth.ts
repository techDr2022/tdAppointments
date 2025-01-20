import NextAuth, { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./lib/db";

// Extend the built-in types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id?: string;
      contact?: string | null;
    } & DefaultSession["user"];
  }

  // Extend the built-in User type without recursive reference
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    contact?: string | null;
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
  }
}

// Define the shape of your Prisma Doctor model
interface PrismaDoctor {
  id: number;
  name: string | null;
  whatsapp: string | null;
  password: string;
  loginId: string;
}

// Define the configuration
const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
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
        if (!credentials?.loginId || !credentials?.password) {
          return null;
        }

        const doctor = (await prisma.doctor.findFirst({
          where: {
            loginId: credentials.loginId,
          },
        })) as PrismaDoctor | null;

        if (!doctor || doctor.password !== credentials.password) {
          return null;
        }

        return {
          id: doctor.id.toString(),
          name: doctor.name,
          email: null,
          contact: doctor.whatsapp,
          image: null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === "signIn" && user) {
        token.id = user.id;
        token.contact = user.contact;
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
        },
      };
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
