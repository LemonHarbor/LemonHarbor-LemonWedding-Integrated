import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function UserManagement() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - in a real app this would come from an API
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "guest" }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("admin.userManagement")}</h3>
        <div className="relative w-64">
          <Input
            placeholder={t("admin.searchUsers")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.name")}</TableHead>
            <TableHead>{t("admin.email")}</TableHead>
            <TableHead>{t("admin.role")}</TableHead>
            <TableHead>{t("admin.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2">
                  {t("admin.edit")}
                </Button>
                <Button variant="outline" size="sm">
                  {t("admin.delete")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
