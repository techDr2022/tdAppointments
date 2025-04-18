"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  registerDoctor,
  sendOTP,
  verifyOTP,
} from "@/actions/DoctorRegistrationHandler";

// Country code options for phone prefixes
const countryCodes = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA" },
  { code: "+44", country: "UK" },
  { code: "+971", country: "UAE" },
  { code: "+65", country: "Singapore" },
];

interface RegistrationFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  countryCode: string;
  phoneNumber: string;
  otp: string;
}

interface FormErrors {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  otp: string;
}

const DoctorRegistrationForm: React.FC = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "+91",
    phoneNumber: "",
    otp: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    otp: "",
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const validateForm = (excludeOtp = true): boolean => {
    const newErrors: FormErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      otp: "",
    };

    let isValid = true;

    // Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Name must be at least 3 characters";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    // OTP validation if needed
    if (!excludeOtp && otpSent && !otpVerified) {
      if (!formData.otp.trim()) {
        newErrors.otp = "OTP is required";
        isValid = false;
      } else if (formData.otp.length !== 6) {
        newErrors.otp = "OTP must be 6 digits";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSendOtp = async () => {
    if (!validateForm(true)) return;

    setIsLoading(true);
    try {
      const result = await sendOTP(formData.phoneNumber, formData.countryCode);

      if (result.success) {
        setOtpSent(true);
        setCountdown(60); // 60 seconds countdown
        toast.success("OTP sent successfully to your phone number");
      } else {
        toast.error(result.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp.trim()) {
      setErrors((prev) => ({ ...prev, otp: "OTP is required" }));
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOTP(formData.phoneNumber, formData.otp);

      if (result.success) {
        setOtpVerified(true);
        toast.success("OTP verified successfully");
      } else {
        toast.error(result.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(false)) return;

    if (!otpVerified) {
      toast.error("Please verify your phone number with OTP");
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerDoctor({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        countryCode: formData.countryCode,
      });

      if (result.success) {
        toast.success("Registration successful!");

        // Redirect to login page after successful registration
        setTimeout(() => {
          router.push("/admin-login");
        }, 2000);
      } else {
        toast.error(result.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-md">
      <ToastContainer position="top-right" autoClose={3000} />
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-blue-600">
          Doctor Registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-blue-600">
              Full Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Dr. John Doe"
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-600">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="doctor@example.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-600">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="********"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-blue-600">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="********"
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-blue-600">
              Phone Number
            </Label>
            <div className="flex gap-2">
              <Select
                value={formData.countryCode}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, countryCode: value }))
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.code} ({country.country})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="10-digit number"
                className={`flex-1 ${errors.phoneNumber ? "border-red-500" : ""}`}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSendOtp}
                disabled={isLoading || otpVerified || countdown > 0}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
              >
                {countdown > 0
                  ? `Resend in ${countdown}s`
                  : otpSent
                    ? "Resend OTP"
                    : "Send OTP"}
              </Button>
            </div>
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
            )}
          </div>

          {otpSent && !otpVerified && (
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-blue-600">
                Enter OTP
              </Label>
              <div className="flex gap-2">
                <Input
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="6-digit OTP"
                  className={`flex-1 ${errors.otp ? "border-red-500" : ""}`}
                  maxLength={6}
                />
                <Button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isLoading || !formData.otp}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Verify
                </Button>
              </div>
              {errors.otp && (
                <p className="text-red-500 text-sm">{errors.otp}</p>
              )}
            </div>
          )}

          {otpVerified && (
            <div className="rounded-md bg-green-50 p-2 text-sm text-green-600 flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-4.25 4.5a.75.75 0 0 1-1.1.05L4.22 8.03a.75.75 0 1 1 1.06-1.06l2.08 2.08 3.61-4.08z" />
              </svg>
              Phone number verified successfully
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading || !otpVerified}
          >
            {isLoading ? "Processing..." : "Register as Doctor"}
          </Button>

          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link href="/admin-login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DoctorRegistrationForm;
