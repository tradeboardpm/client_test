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
import { PhoneInput } from "@/components/ui/phone-input";
import Cookies from "js-cookie";

export default function PersonalDetailsSection({ user, setUser, fetchUserData, api }) {
  const { toast } = useToast();
  const [personalDetailsOpen, setPersonalDetailsOpen] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Sync personalForm with user prop when it changes
  useEffect(() => {
    if (user) {
      setPersonalForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const validatePhoneNumber = (phone) => {
    return phone.length <= 15;
  };

  const handlePersonalDetailsSubmit = async () => {
    try {
      const updateData = {
        name: personalForm.name,
        phone: personalForm.phone,
      };
      await api.patch("/user/profile", updateData);
      setUser({ ...user, ...updateData });
      setPersonalDetailsOpen(false);
      Cookies.set("userName", personalForm.name || "", { expires: 7 });
      Cookies.set("userPhone", personalForm.phone || "", { expires: 7 });
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });
      window.location.reload();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast({
          title: "Error",
          description: error.response.data.message || "Phone number already in use",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => setPersonalDetailsOpen(true)}
          >
            Edit
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={user?.name || ""} readOnly className="active:outline-none" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} readOnly className="active:outline-none" />
            </div>
            {user?.phone && (
              <div>
                <Label>Phone number</Label>
                <Input value={user?.phone} readOnly className="active:outline-none" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={personalDetailsOpen} onOpenChange={setPersonalDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Personal Details</DialogTitle>
            <DialogDescription>Update your personal information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={personalForm.name}
                onChange={(e) =>
                  setPersonalForm({ ...personalForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={personalForm.email}
                readOnly
                className="active:outline-none"
              />
            </div>
            {user?.phone && (
              <div>
                <Label htmlFor="phone">Phone</Label>
                <PhoneInput
                  id="phone"
                  value={personalForm.phone}
                  onChange={(value) => {
                    if (validatePhoneNumber(value || "")) {
                      setPersonalForm({
                        ...personalForm,
                        phone: value || "",
                      });
                    } else {
                      toast({
                        title: "Invalid Phone Number",
                        description: "Phone number must not exceed 15 characters",
                        variant: "destructive",
                      });
                    }
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPersonalDetailsOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePersonalDetailsSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}