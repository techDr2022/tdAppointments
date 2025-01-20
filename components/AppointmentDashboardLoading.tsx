"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AppointmentLoadingSkeleton = () => {
  return (
    <div className="w-full p-6 space-y-6">
      {/* Filter Skeletons */}
      <div className="flex items-center justify-between">
        <div className="w-32 h-10 bg-gray-200 animate-pulse rounded" />
        <div className="w-40 h-10 bg-gray-200 animate-pulse rounded" />
        <div className="flex space-x-4">
          <div className="w-48 h-10 bg-gray-200 animate-pulse rounded" />
          <div className="w-32 h-10 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>

      {/* Table Skeleton */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]">
              <div className="w-4 h-4 bg-gray-200 rounded" />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Treatment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="w-28 h-4 bg-gray-200 rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppointmentLoadingSkeleton;
