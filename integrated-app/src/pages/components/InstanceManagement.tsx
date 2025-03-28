import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function InstanceManagement() {
  const { t } = useTranslation();
  
  // Mock data - in a real app this would come from an API
  const instances = [
    { id: 1, name: "Wedding Instance 1", status: "active", created: "2025-01-15" },
    { id: 2, name: "Wedding Instance 2", status: "active", created: "2025-02-20" },
    { id: 3, name: "Wedding Instance 3", status: "inactive", created: "2025-03-10" }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("admin.instanceManagement")}</h3>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.instanceName")}</TableHead>
            <TableHead>{t("admin.status")}</TableHead>
            <TableHead>{t("admin.created")}</TableHead>
            <TableHead>{t("admin.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instances.map((instance) => (
            <TableRow key={instance.id}>
              <TableCell>{instance.name}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  instance.status === "active" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {instance.status}
                </span>
              </TableCell>
              <TableCell>{instance.created}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2">
                  {t("admin.edit")}
                </Button>
                <Button variant="outline" size="sm">
                  {instance.status === "active" 
                    ? t("admin.deactivate") 
                    : t("admin.activate")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
