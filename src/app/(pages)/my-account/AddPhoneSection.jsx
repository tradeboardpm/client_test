import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
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

export default function AddPhoneSection({ api, fetchUserData }) {
  const { toast } = useToast();
  const [addPhoneOpen, setAddPhoneOpen] = useState(false);
  const [verifyPhoneOpen, setVerifyPhoneOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  const validatePhoneNumber = (phone) => {
    return phone.length <= 15;
  };

  const validateOtp = (otp) => {
    return otp.length === 6 && /^\d+$/.test(otp);
  };

  const handleAddPhone = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must not exceed 15 characters",
        variant: "destructive",
      });
      return;
    }
    try {
      await api.post("/user/add-phone", { phone: phoneNumber });
      setAddPhoneOpen(false);
      setVerifyPhoneOpen(true);
      toast({
        title: "Success",
        description: "OTP sent to your phone number",
        variant: "default",
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast({
          title: "Phone Number Error",
          description: error.response.data.error || "Phone number is already in use",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to add phone number",
          variant: "destructive",
        });
      }
    }
  };

  const handleVerifyPhone = async () => {
    if (!validateOtp(otp)) {
      toast({
        title: "Invalid OTP",
        description: "OTP must be exactly 6 digits",
        variant: "destructive",
      });
      return;
    }
    try {
      await api.post("/user/verify-phone", { otp });
      setVerifyPhoneOpen(false);
      fetchUserData();
      toast({
        title: "Success",
        description: "Phone number verified successfully",
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify phone number",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Add Phone Number</CardTitle>
            <CardDescription>Add and verify your phone number</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setAddPhoneOpen(true)}>
            Add Phone
          </Button>
        </CardHeader>
      </Card>

      <Dialog open={addPhoneOpen} onOpenChange={setAddPhoneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Phone Number</DialogTitle>
            <DialogDescription>Enter your phone number to receive an OTP</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <PhoneInput
                id="phoneNumber"
                value={phoneNumber}
                onChange={(value) => {
                  if (validatePhoneNumber(value || "")) {
                    setPhoneNumber(value || "");
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPhoneOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPhone}>Send OTP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={verifyPhoneOpen} onOpenChange={setVerifyPhoneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
            <DialogDescription>Enter the OTP sent to your phone</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                maxLength={6}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,6}$/.test(value)) {
                    setOtp(value);
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVerifyPhoneOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleVerifyPhone}>Verify OTP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}