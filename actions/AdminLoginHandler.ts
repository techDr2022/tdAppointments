"use server";

import { signIn } from "@/auth";
import { AdminFormData } from "@/components/AdminLoginForm";
import { CredentialsSignin } from "next-auth";

export async function AdminLoginHandler(data: AdminFormData) {
  try {
    console.log(data);
    if (!data.loginId || !data.password) {
      return "provide all fields";
    }
    await signIn("credentials", {
      loginId: data.loginId,
      password: data.password,
      redirect: false,
    });
    return true;
  } catch (error) {
    const err = error as CredentialsSignin;
    return err.cause?.err?.message;
  }
}
