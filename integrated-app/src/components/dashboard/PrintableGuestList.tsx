import React, { forwardRef } from "react";
import { Guest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface PrintableGuestListProps {
  guests: Guest[];
  title: string;
  showTableAssignments?: boolean;
}

const PrintableGuestList = forwardRef<HTMLDivElement, PrintableGuestListProps>(
  ({ guests, title, showTableAssignments = true }, ref) => {
    const getRsvpBadge = (status: string) => {
      switch (status) {
        case "confirmed":
          return (
            <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
          );
        case "declined":
          return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
        case "pending":
          return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
        default:
          return null;
      }
    };

    return (
      <div ref={ref} className="p-8 bg-white">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-500 mt-1">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-2 text-left">Name</th>
              <th className="py-2 text-left">Email</th>
              <th className="py-2 text-left">Phone</th>
              <th className="py-2 text-left">RSVP Status</th>
              {showTableAssignments && (
                <th className="py-2 text-left">Table Assignment</th>
              )}
              <th className="py-2 text-left">Dietary Restrictions</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id} className="border-b border-gray-200">
                <td className="py-3">{guest.name}</td>
                <td className="py-3">{guest.email}</td>
                <td className="py-3">{guest.phone || "-"}</td>
                <td className="py-3">{getRsvpBadge(guest.rsvpStatus)}</td>
                {showTableAssignments && (
                  <td className="py-3">{guest.tableAssignment || "-"}</td>
                )}
                <td className="py-3">{guest.dietaryRestrictions || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>LemonHarbor Wedding Planning</p>
        </div>
      </div>
    );
  },
);

PrintableGuestList.displayName = "PrintableGuestList";

export default PrintableGuestList;
