import React from "react";
import VendorComparisonTool from "@/components/vendor/VendorComparisonTool";
import { useNavigate } from "react-router-dom";

const VendorComparisonPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6">
      <VendorComparisonTool
        onBack={() => navigate("/vendor-management")}
        onViewVendorDetail={(vendor) => {
          // Navigate to vendor detail page with the vendor ID
          navigate(`/vendor-management?vendorId=${vendor.id}`);
        }}
      />
    </div>
  );
};

export default VendorComparisonPage;
