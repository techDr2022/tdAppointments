"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Download, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PrescriptionForm = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    sex: "",
    date: "",
    weight: "",
    temp: "",
    pr: "",
    bp: "",
    resp: "",
    spo2: "",
    painScore: "",
    prescriptionText: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card id="prescription-form" className="w-full bg-white shadow-lg">
        <div className="bg-[#00A19C] text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <img
                src="/api/placeholder/80/80"
                alt="UNO Clinics Logo"
                className="w-20 h-20"
              />
              <div>
                <h1 className="text-2xl font-bold">UNO</h1>
                <p className="text-sm">SUPER SPECIALITY CLINICS</p>
                <p className="text-xs mt-1">
                  Uro-Andrology | Neurosurgery | Orthopaedics
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">Dr Jagdish Pusa</h2>
              <p className="text-sm">MBBS (Osm), MS Ortho (Osm)</p>
              <p className="text-sm">Consultant Trauma &</p>
              <p className="text-sm">Joint Replacement Surgeon</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2">
              <label className="text-sm text-gray-600">Patient Name:</label>
              <Input
                value={formData.patientName}
                onChange={(e) =>
                  handleInputChange("patientName", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Age/Sex:</label>
              <div className="flex gap-2">
                <Input
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  placeholder="Age"
                  className="mt-1"
                />
                <select
                  value={formData.sex}
                  onChange={(e) => handleInputChange("sex", e.target.value)}
                  className="mt-1 border rounded-md p-2"
                >
                  <option value="">Sex</option>
                  <option value="M">M</option>
                  <option value="F">F</option>
                  <option value="O">O</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4 mb-6">
            <div>
              <label className="text-sm text-gray-600">Weight</label>
              <Input
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">TEMP</label>
              <Input
                value={formData.temp}
                onChange={(e) => handleInputChange("temp", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">PR</label>
              <Input
                value={formData.pr}
                onChange={(e) => handleInputChange("pr", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">BP</label>
              <Input
                value={formData.bp}
                onChange={(e) => handleInputChange("bp", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">RESP</label>
              <Input
                value={formData.resp}
                onChange={(e) => handleInputChange("resp", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">SPO2</label>
              <Input
                value={formData.spo2}
                onChange={(e) => handleInputChange("spo2", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">PAIN</label>
              <Input
                value={formData.painScore}
                onChange={(e) => handleInputChange("painScore", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="text-6xl text-gray-300 mb-4">Rx</div>
            <Textarea
              value={formData.prescriptionText}
              onChange={(e) =>
                handleInputChange("prescriptionText", e.target.value)
              }
              rows={10}
              className="w-full p-2 border rounded-md"
              placeholder="Enter prescription details..."
            />
          </div>

          <div className="mt-8 flex justify-between items-end">
            <div className="text-sm text-gray-600">
              <p>For Appointments Call: +91 81437 71911</p>
              <p className="text-xs mt-1">
                Uno super speciality clinics, 2-3-44, Uppal Main Rd, Hanumansai
                Nagar,
              </p>
              <p className="text-xs">
                Vijayapuri Colony, Uppal, Hyderabad, Telangana 500039
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Note: Valid for Two Visits within 15 Days
              </p>
              <div className="flex gap-2">
                <Button className="bg-[#00A19C]" disabled={isSaving}>
                  {isSaving ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrescriptionForm;
