"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { XCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { findAppointmentById } from "@/actions/CreateAppointment";
import { appointmentDetails } from "@/actions/SendMessage";
import {
  SendCancelMessageBMT,
  SendConfirmMessageBMT,
} from "@/actions/SendMessageBmt";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ActionStatus = "idle" | "loading" | "success" | "error";
const AppointmentActionPage = () => {
  const { action, appointmentId } = useParams();
  const [status, setStatus] = useState<ActionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processAppointment = async () => {
      // Validate input
      if (
        !appointmentId ||
        !action ||
        (action !== "confirm" && action !== "cancel")
      ) {
        setStatus("error");
        setErrorMessage("Invalid appointment action");
        return;
      }

      try {
        // Set loading state
        setStatus("loading");

        // Convert appointmentId to number
        const appointIdInt = Number.parseInt(appointmentId as string);

        // Check appointment validity
        const appointmentExists = await findAppointmentById(appointIdInt);
        console.log(appointmentExists);
        if (
          appointmentExists?.status === "CANCELLED" ||
          appointmentExists?.status === "RESCHEDULED"
        ) {
          setStatus("success");
        } else {
          if (appointmentExists) {
            // Fetch additional details
            const details = await appointmentDetails(appointIdInt);

            if (!details) {
              setStatus("error");
              setErrorMessage("Appointment not found");
              return;
            }

            // Process the action
            let result = false;
            if (action === "confirm") {
              if (appointmentExists?.status === "CONFIRMED") {
                result = true;
              } else {
                result = await SendConfirmMessageBMT(details);
              }
            } else if (action === "cancel") {
              if (appointmentExists?.status === "CANCELLED") {
                result = true;
              } else {
                result = await SendCancelMessageBMT(details);
              }
            }

            // Update status based on result
            if (result) {
              setStatus("success");
            } else {
              setStatus("error");
              setErrorMessage("Failed to process the appointment action");
            }
          } else {
            setStatus("error");
            setErrorMessage("Appointment cannot be processed");
          }
        }
      } catch (error) {
        console.error("Appointment processing error:", error);
        setStatus("error");
        setErrorMessage("An unexpected error occurred");
      }
    };

    if (appointmentId && action) {
      processAppointment();
    }
  }, [appointmentId, action]);

  // Loader Component
  const LoadingState = () => (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Processing {action} Request</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center space-x-4">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p>Please wait while we process your request...</p>
      </CardContent>
    </Card>
  );

  // Success Component
  const SuccessState = () => (
    <Card className="max-w-md mx-auto border-green-500">
      <CardHeader className="bg-green-50">
        <CardTitle className="flex items-center text-green-700">
          <CheckCircle className="mr-2 text-green-500" />
          Appointment {action}ed Successfully
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-4">
        <Alert variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Confirmation Details</AlertTitle>
          <AlertDescription>Appointment ID: {appointmentId}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => window.close()}>Close Window</Button>
        </div>
      </CardContent>
    </Card>
  );

  // Error Component
  const ErrorState = () => (
    <Card className="max-w-md mx-auto border-red-500">
      <CardHeader className="bg-red-50">
        <CardTitle className="flex items-center text-red-700">
          <XCircle className="mr-2 text-red-500" />
          Action Failed
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {errorMessage || "Unable to process your request"}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center space-x-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
          <Button onClick={() => window.close()}>Close</Button>
        </div>
      </CardContent>
    </Card>
  );

  // Render based on current status
  const renderContent = () => {
    switch (status) {
      case "loading":
        return <LoadingState />;
      case "success":
        return <SuccessState />;
      case "error":
        return <ErrorState />;
      default:
        return <LoadingState />;
    }
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
      {renderContent()}
    </div>
  );
};

export default AppointmentActionPage;
