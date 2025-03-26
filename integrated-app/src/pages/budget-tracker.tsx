import React from "react";
import { Layout } from "@/components/layout";
import BudgetTracker from "@/components/budget/BudgetTracker";

const BudgetTrackerPage = () => {
  return (
    <Layout>
      <BudgetTracker initialTotalBudget={20000} />
    </Layout>
  );
};

export default BudgetTrackerPage;
