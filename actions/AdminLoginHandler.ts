"use server";

import { signIn } from "@/auth";
import { AdminFormData } from "@/components/AdminLoginForm";
import { CredentialsSignin } from "next-auth";

export async function AdminLoginHandler(data: AdminFormData) {
  if (!data.loginId || !data.password) {
    return { success: false, message: "All fields are required" };
  }

  try {
    const result = await signIn("credentials", {
      loginId: data.loginId,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }

    // For successful authentication, return success and let the client handle redirect
    return {
      success: true,
      redirectUrl: "/admin/appointments",
    };
  } catch (error) {
    console.error("Login error:", error);

    return {
      success: false,
      message:
        error instanceof CredentialsSignin
          ? "Invalid credentials"
          : "Something went wrong",
    };
  }
}
