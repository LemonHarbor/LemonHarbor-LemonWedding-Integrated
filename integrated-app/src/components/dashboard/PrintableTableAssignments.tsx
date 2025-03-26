import React, { forwardRef } from "react";
import { Table, Guest } from "@/lib/api";

interface PrintableTableAssignmentsProps {
  tables: Table[];
  guests: Guest[];
  title: string;
}

const PrintableTableAssignments = forwardRef<
  HTMLDivElement,
  PrintableTableAssignmentsProps
>(({ tables, guests, title }, ref) => {
  const getGuestName = (guestId: string) => {
    const guest = guests.find((g) => g.id === guestId);
    return guest ? guest.name : "Unknown Guest";
  };

  const getTableShape = (shape: string) => {
    switch (shape) {
      case "round":
        return "Round";
      case "rectangle":
        return "Rectangle";
      case "oval":
        return "Oval";
      default:
        return "Unknown";
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

      <div className="grid gap-8">
        {tables.map((table) => (
          <div key={table.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">{table.name}</h2>
              <div className="text-sm text-gray-500">
                {getTableShape(table.shape)} • Capacity: {table.capacity}
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-left">Guest Name</th>
                  <th className="py-2 text-left">Dietary Restrictions</th>
                </tr>
              </thead>
              <tbody>
                {table.guests.length > 0 ? (
                  table.guests.map((guestId) => {
                    const guest = guests.find((g) => g.id === guestId);
                    return (
                      <tr key={guestId} className="border-b border-gray-100">
                        <td className="py-2">{getGuestName(guestId)}</td>
                        <td className="py-2">
                          {guest?.dietaryRestrictions || "-"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={2} className="py-3 text-center text-gray-500">
                      No guests assigned to this table
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="mt-2 text-sm text-gray-500 text-right">
              {table.guests.length}/{table.capacity} seats filled
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>LemonHarbor Wedding Planning</p>
      </div>
    </div>
  );
});

PrintableTableAssignments.displayName = "PrintableTableAssignments";

export default PrintableTableAssignments;
