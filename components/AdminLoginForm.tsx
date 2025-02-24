"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminLoginHandler } from "@/actions/AdminLoginHandler";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AdminFormData {
  type: "Individual" | "Clinic";
  loginId: string;
  password: string;
}

interface FormErrors {
  type: string;
  loginId: string;
  password: string;
}

const AdminLoginForm = () => {
  const [formData, setFormData] = useState<AdminFormData>({
    type: "Individual",
    loginId: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    type: "",
    loginId: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setisClient] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      type: "",
      loginId: "",
      password: "",
    };
    let isValid = true;

    if (!formData.type) {
      newErrors.type = "Please select a type";
      isValid = false;
    }

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

  const handleTypeChange = (value: "Individual" | "Clinic") => {
    setFormData((prev) => ({
      ...prev,
      type: value,
    }));
    // Clear type error if it exists
    if (errors.type) {
      setErrors((prev) => ({
        ...prev,
        type: "",
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
        setRedirecting(true);

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
              htmlFor="type"
              className="block text-sm font-medium text-blue-600"
            >
              Account Type
            </label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Clinic">Clinic</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>

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
