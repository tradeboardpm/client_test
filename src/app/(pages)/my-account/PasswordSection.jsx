import { useState } from "react";
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

export default function PasswordSection({ api }) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  const validatePassword = (password) => {
    const validationRules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordValidation(validationRules);
    return Object.values(validationRules).every(Boolean);
  };

  const handlePasswordSubmit = async () => {
    if (!validatePassword(passwordForm.newPassword)) {
      toast({
        title: "Invalid Password",
        description: "Please meet all password requirements",
        variant: "destructive",
      });
      return;
    }
    try {
      await api.patch("/user/change-password", passwordForm);
      setPasswordDialogOpen(false);
      toast({
        title: "Success",
        description: "Password updated successfully",
        variant: "default",
      });
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Password</CardTitle>
            <CardDescription>Manage your password</CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => setPasswordDialogOpen(true)}
          >
            Change Password
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value="********"
              readOnly
              className="active:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current and new password</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  const newPassword = e.target.value;
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: newPassword,
                  });
                  validatePassword(newPassword);
                }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Password Requirements:
              <ul className="list-disc pl-5">
                <li className={passwordValidation.length ? "text-green-600" : "text-red-600"}>
                  At least 8 characters
                </li>
                <li className={passwordValidation.uppercase ? "text-green-600" : "text-red-600"}>
                  Contains an uppercase letter
                </li>
                <li className={passwordValidation.lowercase ? "text-green-600" : "text-red-600"}>
                  Contains a lowercase letter
                </li>
                <li className={passwordValidation.number ? "text-green-600" : "text-red-600"}>
                  Contains a number
                </li>
                <li className={passwordValidation.symbol ? "text-green-600" : "text-red-600"}>
                  Contains a special symbol
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}