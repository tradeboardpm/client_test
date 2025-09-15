import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function DashboardSettingsSection({ settings, setSettings, api }) {
  const { toast } = useToast();
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    capital: 0,
    brokerage: 0,
    tradesPerDay: 0,
  });

  // Sync settingsForm with settings prop when it changes
  useEffect(() => {
    if (settings) {
      setSettingsForm({
        capital: parseFloat((settings.capital || 0).toFixed(2)),
        brokerage: parseFloat((settings.brokerage || 0).toFixed(2)),
        tradesPerDay: Math.max(0, Math.floor(settings.tradesPerDay || 0)),
      });
    }
  }, [settings]);

  const handleSettingsSubmit = async () => {
    try {
      const response = await api.patch("/user/settings", settingsForm);
      setSettings(response.data);
      setSettingsDialogOpen(false);
      toast({
        title: "Success",
        description: "Settings updated successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  // Helper to round values to two decimals
  const formatTwoDecimals = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : parseFloat(num.toFixed(2));
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Dashboard Settings</CardTitle>
            <CardDescription>Manage your trading preferences</CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => setSettingsDialogOpen(true)}
          >
            Edit
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Capital</Label>
              <Input
                value={(settings?.capital ?? 0).toFixed(2)}
                readOnly
                className="active:outline-none"
              />
            </div>
            <div>
              <Label>Brokerage</Label>
              <Input
                value={(settings?.brokerage ?? 0).toFixed(2)}
                readOnly
                className="active:outline-none"
              />
            </div>
            <div>
              <Label>Trades Per Day</Label>
              <Input
                value={Math.max(0, Math.floor(settings?.tradesPerDay ?? 0))}
                readOnly
                className="active:outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dashboard Settings</DialogTitle>
            <DialogDescription>Update your trading preferences</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="capital">Capital</Label>
              <Input
                id="capital"
                type="number"
                min="0"
                step="0.01"
                value={settingsForm.capital}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    capital: formatTwoDecimals(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="brokerage">Brokerage</Label>
              <Input
                id="brokerage"
                type="number"
                min="0"
                step="0.01"
                value={settingsForm.brokerage}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    brokerage: formatTwoDecimals(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="tradesPerDay">Trades Per Day</Label>
              <Input
                id="tradesPerDay"
                type="number"
                min="0"
                step="1"
                value={settingsForm.tradesPerDay}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    tradesPerDay: Math.max(0, Math.floor(Number(e.target.value))),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSettingsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSettingsSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
