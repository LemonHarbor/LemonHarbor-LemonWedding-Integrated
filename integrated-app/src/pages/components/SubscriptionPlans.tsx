import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SubscriptionPlans() {
  const { t } = useTranslation();

  const plans = [
    {
      name: "Basic",
      price: "$9.99",
      features: [
        "Up to 50 guests",
        "Basic RSVP functionality",
        "Email support"
      ]
    },
    {
      name: "Premium",
      price: "$19.99",
      features: [
        "Up to 200 guests",
        "Advanced RSVP functionality",
        "Table planning",
        "Priority support"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Unlimited guests",
        "All premium features",
        "Dedicated account manager",
        "24/7 support"
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("admin.subscriptionPlans")}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.name}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-2xl font-bold">{plan.price}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-4">
                {t("admin.selectPlan")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
