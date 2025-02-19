"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminLoginHandler } from "@/actions/AdminLoginHandler";
import { useRouter } from "next/navigation";

export interface AdminFormData {
  loginId: string;
  password: string;
}

interface FormErrors {
  loginId: string;
  password: string;
}

const AdminLoginForm = () => {
  const [formData, setFormData] = useState<AdminFormData>({
    loginId: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    loginId: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setisClient] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      loginId: "",
      password: "",
    };
    let isValid = true;

    if (!formData.loginId) {
      newErrors.loginId = "Login ID is required";
      isValid = false;
    } else if (formData.loginId.length < 3) {
      newErrors.loginId = "Login ID must be at least 3 characters";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      console.log("Form submitted:", formData);

      const result = await AdminLoginHandler(formData);
      console.log(result);

      if (result?.success) {
        console.log("Login successful");
        // Show redirecting message and keep button disabled
        setRedirecting(true);

        // Use the redirectUrl from the result
        if (result.redirectUrl) {
          router.push("admin/appointments");
        }
      } else {
        setIsSubmitting(false);
        alert(result?.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      // Only reset isSubmitting if there was an error
      // Keep it true if redirecting
      if (!setRedirecting) {
        setIsSubmitting(false);
      }
    }
  };
  useEffect(() => {
    setisClient(true);
  }, []);

  if (!isClient) {
    return <div>...loading...</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl text-blue-600">Doctor Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="loginId"
              className="block text-sm font-medium text-blue-600"
            >
              Login ID
            </label>
            <Input
              id="loginId"
              name="loginId"
              type="text"
              value={formData.loginId}
              onChange={handleChange}
              className={`w-full ${errors.loginId ? "border-red-500" : ""}`}
            />
            {errors.loginId && (
              <p className="text-sm text-red-500">{errors.loginId}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-blue-600"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full ${errors.password ? "border-red-500" : ""}`}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting || redirecting}
          >
            {redirecting
              ? "Redirecting to dashboard..."
              : isSubmitting
                ? "Logging in..."
                : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminLoginForm;
