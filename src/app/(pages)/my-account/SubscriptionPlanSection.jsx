import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SubscriptionPlan from "@/components/cards/subsciption";

export default function SubscriptionPlanSection({
  user,
  showUpgradeDialog,
  setShowUpgradeDialog,
  needsUpgrade,
}) {
  const formatPlanName = (plan) => {
    switch (plan) {
      case "one-week":
        return "Free 7 Days";
      case "half-year":
        return "6 Months Plan";
      case "yearly":
        return "Yearly Plan";
      default:
        return plan;
    }
  };

  const handleCloseDialog = () => {
    setShowUpgradeDialog(false);
  };

  const isLoading = !user || user.subscription === undefined;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>Manage your subscription details</CardDescription>
          </div>
          {needsUpgrade() && (
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(true)}
            >
              Upgrade
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Current Plan</Label>
              <Input
                value={
                  isLoading
                    ? "Loading..."
                    : user.subscription
                    ? formatPlanName(user.subscription.plan)
                    : "No Plan"
                }
                readOnly
                className="active:outline-none"
              />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input
                value={
                  isLoading
                    ? "Loading..."
                    : user.subscription
                    ? new Date(user.subscription.expiresAt).toLocaleDateString()
                    : "N/A"
                }
                readOnly
                className="active:outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-7xl">
          <SubscriptionPlan onCloseDialog={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    </>
  );
}
