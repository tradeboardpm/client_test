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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function CreatePasswordSection({ api, fetchUserData }) {
  const { toast } = useToast();
  const [createPasswordOpen, setCreatePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    maxLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  const validatePassword = (password) => {
    const validationRules = {
      length: password.length >= 8,
      maxLength: password.length <= 15,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordValidation(validationRules);
    return Object.values(validationRules).every(Boolean);
  };

  const handleCreatePassword = async () => {
    if (!validatePassword(newPassword)) {
      toast({
        title: "Invalid Password",
        description: "Please meet all password requirements, including maximum length of 15 characters",
        variant: "destructive",
      });
      return;
    }
    try {
      await api.post("/user/create-password", { password: newPassword });
      setCreatePasswordOpen(false);
      toast({
        title: "Success",
        description: "Password created successfully",
        variant: "default",
      });
      setNewPassword("");
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create password",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Create Password</CardTitle>
            <CardDescription>Please set your password</CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => setCreatePasswordOpen(true)}
          >
            Create Password
          </Button>
        </CardHeader>
      </Card>

      <Dialog open={createPasswordOpen} onOpenChange={setCreatePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Password</DialogTitle>
            <DialogDescription>Set a password for your Google-linked account</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  const password = e.target.value;
                  setNewPassword(password);
                  validatePassword(password);
                }}
                maxLength={15}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Password Requirements:
              <ul className="list-disc pl-5">
                <li className={passwordValidation.length ? "text-green-600" : "text-red-600"}>
                  At least 8 characters
                </li>
                <li className={passwordValidation.maxLength ? "text-green-600" : "text-red-600"}>
                  No more than 15 characters
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
              onClick={() => setCreatePasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePassword}>Create Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}