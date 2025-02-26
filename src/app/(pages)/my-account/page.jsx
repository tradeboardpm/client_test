"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Monitor, MonitorX } from "lucide-react";
import PhoneNumberInput from "@/components/ui/phone-input";
import SubscriptionPlan from "@/components/cards/subsciption";

export default function AccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Dialog states
  const [personalDetailsOpen, setPersonalDetailsOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [settingsForm, setSettingsForm] = useState({
    capital: 0,
    brokerage: 0,
    tradesPerDay: 0,
  });

  // Validation states
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });



  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [createPasswordOpen, setCreatePasswordOpen] = useState(false);
  const [addPhoneOpen, setAddPhoneOpen] = useState(false);
  const [verifyPhoneOpen, setVerifyPhoneOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  // Axios instance with interceptor for bearer token
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add a request interceptor to include the bearer token
  api.interceptors.request.use(
    (config) => {
      const token = Cookies.get("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Password validation function
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

  useEffect(() => {
    fetchUserData();
    fetchSettings();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/user/profile");
      setUser(response.data);
      setPersonalForm(response.data);
      setIsGoogleUser(!!response.data.googleId);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch user data",
        variant: "destructive",
      });
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get("/user/settings");
      setSettings(response.data);
      setSettingsForm(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch settings",
        variant: "destructive",
      });
    }
  };

  const handlePersonalDetailsSubmit = async () => {
    try {
      await api.patch("/user/profile", personalForm);
      setUser(personalForm);
      setPersonalDetailsOpen(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = async () => {
    // Validate password before submission
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
      // Reset password form
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

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
        description:
          error.response?.data?.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const handleCreatePassword = async () => {
    // Validate password before submission
    if (!validatePassword(newPassword)) {
      toast({
        title: "Invalid Password",
        description: "Please meet all password requirements",
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
      // Reset new password
      setNewPassword("");
      // Refresh the page
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create password",
        variant: "destructive",
      });
    }
  };

  const handleAddPhone = async () => {
    // Validate phone number is not empty
    if (!phoneNumber.trim()) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a phone number",
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
      // Specifically handle phone number already in use error
      if (error.response && error.response.status === 400) {
        toast({
          title: "Phone Number Error",
          description:
            error.response.data.error || "Phone number is already in use",
          variant: "destructive",
        });
      } else {
        // Generic error handling for other types of errors
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to add phone number",
          variant: "destructive",
        });
      }
    }
  };

  const handleVerifyPhone = async () => {
    try {
      await api.post("/user/verify-phone", { otp });
      setVerifyPhoneOpen(false);
      fetchUserData(); // Refresh user data
      toast({
        title: "Success",
        description: "Phone number verified successfully",
      });
      // Refresh the page
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify phone number",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      Cookies.remove("token");
      Cookies.remove("expiry");
      Cookies.remove("userName");
      Cookies.remove("userEmail");
      Cookies.remove("userId");
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Logout failed",
        variant: "destructive",
      });
    }
  };

  const handleLogoutAll = async () => {
    try {
      await api.post("/auth/logout-all");
      Cookies.remove("token");
      Cookies.remove("expiry");
      Cookies.remove("userName");
      Cookies.remove("userEmail");
      Cookies.remove("userId");
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Logout from all devices failed",
        variant: "destructive",
      });
    }
  };



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

  // Function to check if plan needs upgrade
  const needsUpgrade = () => {
    if (!user?.subscription) return false;
    
    const expiryDate = new Date(user.subscription.expiresAt);
    const currentDate = new Date();
    
    return (
      user.subscription.plan === "one-week" ||
      expiryDate <= currentDate
    );
  };

  return (
    <div className="bg-card">
      <div className="p-6 bg-background rounded-t-xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">My Account</h1>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-secondary"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Logout from this device
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogoutAll}
                  className="cursor-pointer hover:bg-secondary"
                >
                  <MonitorX className="mr-2 h-4 w-4" />
                  Logout from all devices
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Personal Details Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
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
                <Input value={user?.name} readOnly />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email} readOnly />
              </div>
              {user?.phone && (
                <div>
                  <Label>Phone number</Label>
                  <Input value={user?.phone} readOnly />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Google User Specific Sections */}
        {isGoogleUser && !user?.hasPassword && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Create Password</CardTitle>
                <CardDescription>
                  Set a password for your Google account
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setCreatePasswordOpen(true)}
              >
                Create Password
              </Button>
            </CardHeader>
          </Card>
        )}

        {!user?.phone && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Add Phone Number</CardTitle>
                <CardDescription>
                  Add and verify your phone number
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setAddPhoneOpen(true)}>
                Add Phone
              </Button>
            </CardHeader>
          </Card>
        )}

        {/* Password Section */}
        {user?.hasPassword && (
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
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Settings Section */}
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
                <Input value={settings?.capital} readOnly />
              </div>
              <div>
                <Label>Brokerage</Label>
                <Input value={settings?.brokerage} readOnly />
              </div>
              <div>
                <Label>Trades Per Day</Label>
                <Input value={settings?.tradesPerDay} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card >
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Manage your subscription details
              </CardDescription>
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
                  value={user?.subscription ? formatPlanName(user.subscription.plan) : 'No Plan'} 
                  readOnly 
                />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input 
                  value={user?.subscription 
                    ? new Date(user.subscription.expiresAt).toLocaleDateString()
                    : 'N/A'
                  } 
                  readOnly 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details Dialog */}
        <Dialog
          open={personalDetailsOpen}
          onOpenChange={setPersonalDetailsOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Personal Details</DialogTitle>
              <DialogDescription>
                Update your personal information
              </DialogDescription>
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
                  onChange={(e) =>
                    setPersonalForm({ ...personalForm, email: e.target.value })
                  }
                />
              </div>
              {user?.phone && (
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <PhoneNumberInput
                    id="phone"
                    value={personalForm.phone}
                    onChange={(value) =>
                      setPersonalForm({
                        ...personalForm,
                        phone: value || "",
                      })
                    }
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
              <Button onClick={handlePersonalDetailsSubmit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Password Dialog */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current and new password
              </DialogDescription>
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
                  <li
                    className={
                      passwordValidation.length
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    At least 8 characters
                  </li>
                  <li
                    className={
                      passwordValidation.uppercase
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    Contains an uppercase letter
                  </li>
                  <li
                    className={
                      passwordValidation.lowercase
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    Contains a lowercase letter
                  </li>
                  <li
                    className={
                      passwordValidation.number
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    Contains a number
                  </li>
                  <li
                    className={
                      passwordValidation.symbol
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
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

        {/* Settings Dialog */}
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Dashboard Settings</DialogTitle>
              <DialogDescription>
                Update your trading preferences
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="capital">Capital</Label>
                <Input
                  id="capital"
                  type="number"
                  value={settingsForm.capital}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      capital: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="brokerage">Brokerage</Label>
                <Input
                  id="brokerage"
                  type="number"
                  value={settingsForm.brokerage}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      brokerage: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="tradesPerDay">Trades Per Day</Label>
                <Input
                  id="tradesPerDay"
                  type="number"
                  value={settingsForm.tradesPerDay}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      tradesPerDay: Number(e.target.value),
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

        {/* Create Password Dialog */}
        <Dialog open={createPasswordOpen} onOpenChange={setCreatePasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Password</DialogTitle>
              <DialogDescription>
                Set a password for your Google-linked account
              </DialogDescription>
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
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Password Requirements:
                <ul className="list-disc pl-5">
                  <li
                    className={
                      passwordValidation.length
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    At least 8 characters
                  </li>
                  <li
                    className={
                      passwordValidation.uppercase
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    Contains an uppercase letter
                  </li>
                  <li
                    className={
                      passwordValidation.lowercase
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    Contains a lowercase letter
                  </li>
                  <li
                    className={
                      passwordValidation.number
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    Contains a number
                  </li>
                  <li
                    className={
                      passwordValidation.symbol
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
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

        {/* Add Phone Dialog */}
        <Dialog open={addPhoneOpen} onOpenChange={setAddPhoneOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Phone Number</DialogTitle>
              <DialogDescription>
                Enter your phone number to receive an OTP
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <PhoneNumberInput
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(value) => setPhoneNumber(value || "")}
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

        {/* Verify Phone Dialog */}
        <Dialog open={verifyPhoneOpen} onOpenChange={setVerifyPhoneOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Phone Number</DialogTitle>
              <DialogDescription>
                Enter the OTP sent to your phone
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
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

        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-7xl">
          <SubscriptionPlan />
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
