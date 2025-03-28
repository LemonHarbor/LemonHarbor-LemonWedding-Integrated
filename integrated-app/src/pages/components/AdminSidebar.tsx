import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Users,
  Settings,
  Calendar,
  FileText,
  CreditCard,
  BarChart2,
  Shield
} from "lucide-react";

export function AdminSidebar() {
  const { t } = useTranslation();

  const navItems = [
    { path: "users", icon: <Users className="h-5 w-5" />, label: t("admin.users") },
    { path: "events", icon: <Calendar className="h-5 w-5" />, label: t("admin.events") },
    { path: "reports", icon: <FileText className="h-5 w-5" />, label: t("admin.reports") },
    { path: "billing", icon: <CreditCard className="h-5 w-5" />, label: t("admin.billing") },
    { path: "analytics", icon: <BarChart2 className="h-5 w-5" />, label: t("admin.analytics") },
    { path: "settings", icon: <Settings className="h-5 w-5" />, label: t("admin.settings") },
    { path: "security", icon: <Shield className="h-5 w-5" />, label: t("admin.security") }
  ];

  return (
    <div className="w-64 border-r bg-gray-50 p-4">
      <h2 className="mb-6 text-lg font-semibold">{t("admin.adminPanel")}</h2>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-2 rounded-md p-2 ${
                isActive 
                  ? "bg-blue-100 text-blue-600" 
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
