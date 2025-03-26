import React from "react";
import { Layout } from "@/components/layout";
import VendorManager from "@/components/vendor/VendorManager";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import ExpenseForm from "@/components/budget/ExpenseForm";
import { useToast } from "@/components/ui/use-toast";
import { createExpense, updateExpense } from "@/services/budgetService";
import { linkVendorToExpense } from "@/services/vendorService";
import { useLocation, useNavigate } from "react-router-dom";

const VendorManagement = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  // Parse URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const vendorId = searchParams.get("vendorId");
    const section = searchParams.get("section");

    if (vendorId) {
      setSelectedVendorId(vendorId);
    }

    // Set global initialSection for VendorManager to handle
    if (section) {
      window.initialSection = section;
    }
  }, [location]);

  // Handle adding an expense for a specific vendor
  const handleAddExpense = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    setShowExpenseForm(true);
  };

  // Handle expense form submission
  const handleExpenseSubmit = async (data: any, receipt?: File) => {
    try {
      let expenseData = {
        name: data.name,
        category: data.category,
        amount: data.amount,
        date: data.date.toISOString().split("T")[0],
        status: data.status,
        vendor: data.vendor === "none" ? undefined : data.vendor,
        notes: data.notes,
      };

      // Create the expense
      const savedExpense = await createExpense(expenseData);

      // Link the expense to the vendor
      if (selectedVendorId) {
        await linkVendorToExpense(savedExpense.id, selectedVendorId);
      }

      // Handle receipt upload if provided
      if (receipt && savedExpense.id) {
        // This would be handled by your existing receipt upload logic
        // For example: await uploadReceipt(receipt, savedExpense.id);
      }

      toast({
        title: "Expense Added",
        description: "The expense has been added and linked to the vendor.",
      });

      setShowExpenseForm(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save expense: ${error.message}`,
      });
    }
  };

  // Handle viewing a receipt
  const handleViewReceipt = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <VendorManager
          onAddExpense={handleAddExpense}
          onViewReceipt={handleViewReceipt}
          initialVendorId={selectedVendorId}
        />
      </div>

      {/* Expense Form Dialog */}
      <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
        <DialogContent className="sm:max-w-[600px]">
          <ExpenseForm
            onSubmit={handleExpenseSubmit}
            onCancel={() => setShowExpenseForm(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default VendorManagement;
