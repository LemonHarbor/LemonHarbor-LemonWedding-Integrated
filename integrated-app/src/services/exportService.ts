import { Vendor } from "@/types/vendor";
import { format } from "date-fns";

// Export vendor contact to vCard format
export const exportVendorToVCard = (vendor: Vendor): string => {
  // Create vCard content
  const vCardContent = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${vendor.name}`,
    vendor.contact_name ? `N:${vendor.contact_name};;;` : `N:${vendor.name};;;`,
    vendor.email ? `EMAIL;TYPE=WORK:${vendor.email}` : "",
    vendor.phone ? `TEL;TYPE=WORK:${vendor.phone}` : "",
    vendor.website ? `URL:${vendor.website}` : "",
    vendor.address ? `ADR;TYPE=WORK:;;${vendor.address};;;` : "",
    `CATEGORIES:Wedding Vendor,${vendor.category}`,
    `NOTE:${vendor.notes || ""} - Status: ${vendor.status}`,
    "END:VCARD",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return vCardContent;
};

// Export vendor contact to CSV format
export const exportVendorToCSV = (vendor: Vendor): string => {
  // Create CSV header and content
  const headers = [
    "Name",
    "Contact Person",
    "Category",
    "Email",
    "Phone",
    "Website",
    "Address",
    "Status",
    "Notes",
  ];
  const values = [
    `"${vendor.name}"`,
    `"${vendor.contact_name || ""}"`,
    `"${vendor.category}"`,
    `"${vendor.email || ""}"`,
    `"${vendor.phone || ""}"`,
    `"${vendor.website || ""}"`,
    `"${vendor.address || ""}"`,
    `"${vendor.status}"`,
    `"${(vendor.notes || "").replace(/"/g, '""')}"`,
  ];

  return `${headers.join(",")}\n${values.join(",")}`;
};

// Export multiple vendors to CSV format
export const exportVendorsToCSV = (vendors: Vendor[]): string => {
  if (vendors.length === 0) return "";

  // Create CSV header
  const headers = [
    "Name",
    "Contact Person",
    "Category",
    "Email",
    "Phone",
    "Website",
    "Address",
    "Status",
    "Notes",
  ];

  // Create CSV content
  const rows = vendors.map((vendor) =>
    [
      `"${vendor.name}"`,
      `"${vendor.contact_name || ""}"`,
      `"${vendor.category}"`,
      `"${vendor.email || ""}"`,
      `"${vendor.phone || ""}"`,
      `"${vendor.website || ""}"`,
      `"${vendor.address || ""}"`,
      `"${vendor.status}"`,
      `"${(vendor.notes || "").replace(/"/g, '""')}"`,
    ].join(","),
  );

  return `${headers.join(",")}\n${rows.join("\n")}`;
};

// Download content as a file
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

// Download vendor contact as vCard
export const downloadVendorAsVCard = (vendor: Vendor): void => {
  const vCardContent = exportVendorToVCard(vendor);
  const filename = `${vendor.name.replace(/\s+/g, "_")}_contact.vcf`;
  downloadFile(vCardContent, filename, "text/vcard");
};

// Download vendor contact as CSV
export const downloadVendorAsCSV = (vendor: Vendor): void => {
  const csvContent = exportVendorToCSV(vendor);
  const filename = `${vendor.name.replace(/\s+/g, "_")}_contact.csv`;
  downloadFile(csvContent, filename, "text/csv;charset=utf-8");
};

// Download multiple vendors as CSV
export const downloadVendorsAsCSV = (vendors: Vendor[]): void => {
  const csvContent = exportVendorsToCSV(vendors);
  const filename = `wedding_vendors_${format(new Date(), "yyyy-MM-dd")}.csv`;
  downloadFile(csvContent, filename, "text/csv;charset=utf-8");
};
