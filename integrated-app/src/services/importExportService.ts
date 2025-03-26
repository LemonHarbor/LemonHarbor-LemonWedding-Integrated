import { supabase } from "@/lib/supabase";
import { Guest } from "@/types/guest";
import { format } from "date-fns";

// Parse CSV data into guest objects
export const parseCSVData = (csvData: string): Partial<Guest>[] => {
  try {
    // Split the CSV into rows
    const rows = csvData.split(/\r?\n/);

    // Extract headers (first row)
    const headers = rows[0]
      .split(",")
      .map((header) => header.trim().toLowerCase().replace(/["']/g, ""));

    // Map CSV columns to guest properties
    const columnMap: Record<string, keyof Guest> = {
      name: "name",
      email: "email",
      phone: "phone",
      category: "category",
      "dietary restrictions": "dietary_restrictions",
      dietary_restrictions: "dietary_restrictions",
      "plus one": "plus_one",
      plus_one: "plus_one",
      "rsvp status": "rsvp_status",
      rsvp_status: "rsvp_status",
      notes: "notes",
    };

    // Parse each row into a guest object
    const guests: Partial<Guest>[] = [];

    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue; // Skip empty rows

      const values = parseCSVRow(rows[i]);
      const guest: Partial<Guest> = {};

      // Map each value to the corresponding guest property
      headers.forEach((header, index) => {
        const guestProperty = columnMap[header];
        if (guestProperty && index < values.length) {
          let value = values[index].trim();

          // Handle boolean values
          if (guestProperty === "plus_one") {
            guest[guestProperty] = ["yes", "true", "1"].includes(
              value.toLowerCase(),
            );
          }
          // Handle RSVP status
          else if (guestProperty === "rsvp_status") {
            const status = value.toLowerCase();
            if (["confirmed", "pending", "declined"].includes(status)) {
              guest[guestProperty] = status as
                | "confirmed"
                | "pending"
                | "declined";
            } else {
              guest[guestProperty] = "pending";
            }
          }
          // Handle category
          else if (guestProperty === "category") {
            const category = value.toLowerCase();
            if (["family", "friend", "colleague", "other"].includes(category)) {
              guest[guestProperty] = category;
            } else {
              guest[guestProperty] = "other";
            }
          }
          // Handle other string values
          else {
            guest[guestProperty] = value;
          }
        }
      });

      // Ensure required fields are present
      if (guest.name && guest.email) {
        guests.push(guest);
      }
    }

    return guests;
  } catch (error) {
    console.error("Error parsing CSV data:", error);
    throw new Error("Failed to parse CSV file. Please check the format.");
  }
};

// Helper function to parse CSV row handling quoted values
const parseCSVRow = (row: string): string[] => {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current); // Add the last value
  return result.map((val) => val.replace(/^"|"$/g, "")); // Remove surrounding quotes
};

// Import guests from CSV data
export const importGuests = async (
  csvData: string,
): Promise<{ success: boolean; imported: number; errors: string[] }> => {
  try {
    const parsedGuests = parseCSVData(csvData);
    const errors: string[] = [];
    let imported = 0;

    // Process each guest
    for (const guest of parsedGuests) {
      try {
        // Check if guest with this email already exists
        const { data: existingGuest } = await supabase
          .from("guests")
          .select("id, email")
          .eq("email", guest.email)
          .maybeSingle();

        if (existingGuest) {
          // Update existing guest
          const { error } = await supabase
            .from("guests")
            .update({
              name: guest.name,
              phone: guest.phone || null,
              category: guest.category || "other",
              dietary_restrictions: guest.dietary_restrictions || null,
              plus_one: guest.plus_one || false,
              rsvp_status: guest.rsvp_status || "pending",
              notes: guest.notes || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingGuest.id);

          if (error) throw error;
        } else {
          // Insert new guest
          const { error } = await supabase.from("guests").insert([
            {
              name: guest.name,
              email: guest.email,
              phone: guest.phone || null,
              category: guest.category || "other",
              dietary_restrictions: guest.dietary_restrictions || null,
              plus_one: guest.plus_one || false,
              rsvp_status: guest.rsvp_status || "pending",
              notes: guest.notes || null,
            },
          ]);

          if (error) throw error;
        }

        imported++;
      } catch (error) {
        errors.push(
          `Error with guest ${guest.name} (${guest.email}): ${error.message}`,
        );
      }
    }

    return { success: true, imported, errors };
  } catch (error) {
    console.error("Error importing guests:", error);
    return { success: false, imported: 0, errors: [error.message] };
  }
};

// Export guests to CSV format
export const exportGuestsToCSV = async (): Promise<string> => {
  try {
    // Fetch all guests
    const { data: guests, error } = await supabase
      .from("guests")
      .select("*")
      .order("name");

    if (error) throw error;

    // Define CSV headers
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Category",
      "RSVP Status",
      "Dietary Restrictions",
      "Plus One",
      "Notes",
    ];

    // Convert guests to CSV rows
    const rows = guests.map((guest) => [
      `"${guest.name}"`,
      `"${guest.email}"`,
      guest.phone ? `"${guest.phone}"` : "",
      `"${guest.category}"`,
      `"${guest.rsvp_status}"`,
      guest.dietary_restrictions ? `"${guest.dietary_restrictions}"` : "",
      guest.plus_one ? "Yes" : "No",
      guest.notes ? `"${guest.notes}"` : "",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    return csvContent;
  } catch (error) {
    console.error("Error exporting guests to CSV:", error);
    throw error;
  }
};

// Export guests to JSON format
export const exportGuestsToJSON = async (): Promise<string> => {
  try {
    // Fetch all guests
    const { data: guests, error } = await supabase
      .from("guests")
      .select("*")
      .order("name");

    if (error) throw error;

    // Convert to formatted JSON string
    return JSON.stringify(guests, null, 2);
  } catch (error) {
    console.error("Error exporting guests to JSON:", error);
    throw error;
  }
};

// Export guests to Excel-compatible format (CSV with BOM)
export const exportGuestsToExcel = async (): Promise<string> => {
  try {
    const csvContent = await exportGuestsToCSV();
    // Add BOM for Excel compatibility
    return "\ufeff" + csvContent;
  } catch (error) {
    console.error("Error exporting guests to Excel:", error);
    throw error;
  }
};

// Generate a sample CSV template
export const generateCSVTemplate = (): string => {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Category",
    "RSVP Status",
    "Dietary Restrictions",
    "Plus One",
    "Notes",
  ];
  const sampleRow = [
    '"John Doe"',
    '"john.doe@example.com"',
    '"+1 (555) 123-4567"',
    '"family"',
    '"pending"',
    '"Vegetarian"',
    "Yes",
    '"Best man"',
  ];

  return [headers.join(","), sampleRow.join(",")].join("\n");
};

// Helper function to download content as a file
export const downloadFile = (
  content: string,
  filename: string,
  mimeType: string,
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// Download guests as CSV
export const downloadGuestsAsCSV = async (): Promise<void> => {
  try {
    const csvContent = await exportGuestsToCSV();
    const filename = `wedding_guests_${format(new Date(), "yyyy-MM-dd")}.csv`;
    downloadFile(csvContent, filename, "text/csv;charset=utf-8");
  } catch (error) {
    console.error("Error downloading guests as CSV:", error);
    throw error;
  }
};

// Download guests as JSON
export const downloadGuestsAsJSON = async (): Promise<void> => {
  try {
    const jsonContent = await exportGuestsToJSON();
    const filename = `wedding_guests_${format(new Date(), "yyyy-MM-dd")}.json`;
    downloadFile(jsonContent, filename, "application/json;charset=utf-8");
  } catch (error) {
    console.error("Error downloading guests as JSON:", error);
    throw error;
  }
};

// Download guests as Excel
export const downloadGuestsAsExcel = async (): Promise<void> => {
  try {
    const excelContent = await exportGuestsToExcel();
    const filename = `wedding_guests_${format(new Date(), "yyyy-MM-dd")}.csv`;
    downloadFile(excelContent, filename, "text/csv;charset=utf-8");
  } catch (error) {
    console.error("Error downloading guests as Excel:", error);
    throw error;
  }
};

// Download CSV template
export const downloadCSVTemplate = (): void => {
  const templateContent = generateCSVTemplate();
  const filename = "guest_import_template.csv";
  downloadFile(templateContent, filename, "text/csv;charset=utf-8");
};
