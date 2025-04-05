"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PrivacyPolicy from "@/app/(misc)/privacy/page";
import TermsOfService from "@/app/(misc)/terms/page";
import ReactCountryFlag from "react-country-flag";
import countries from "country-telephone-data";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Image from "next/image";

const LegalDrawer = ({ isOpen, onClose, content }) => (
  <Drawer open={isOpen} onOpenChange={onClose}>
    <DrawerContent>
      <DrawerHeader>
        {/* <DrawerTitle>{content.title}</DrawerTitle> */}
      </DrawerHeader>
      <div className="p-4 max-h-[70vh] overflow-y-auto">
        {content.content}
        <div className="w-full flex justify-end mt-4">
          <DrawerClose asChild className="w-32">
            <Button>Close</Button>
          </DrawerClose>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
);

const termsContent = {
  title: "Terms & Conditions",
  content: <TermsOfService />,
};

const privacyContent = {
  title: "Privacy Policy",
  content: <PrivacyPolicy />,
};

const countryCodes = countries.allCountries.map((country) => ({
  value: country.dialCode,
  label: `${country.name} (+${country.dialCode})`,
  code: country.iso2.toUpperCase(),
}));

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCode: "91",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(null);
  const [showGoogleDialog, setShowGoogleDialog] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("8+ characters");
    if (!/[A-Z]/.test(password)) errors.push("uppercase");
    if (!/[a-z]/.test(password)) errors.push("lowercase");
    if (!/\d/.test(password)) errors.push("number");
    if (!/[!@#$%^&*]/.test(password)) errors.push("symbol");
    return errors;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (id === "password") {
      const passwordErrors = validatePassword(value);
      setErrors((prev) => ({ ...prev, password: passwordErrors }));
    }
    if (id === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value === formData.password ? [] : ["Passwords don't match"],
      }));
    }
  };

  const handleCountryCodeChange = (value) => {
    setFormData((prev) => ({ ...prev, countryCode: value }));
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() &&
      formData.email.trim() &&
      formData.mobile.trim() &&
      formData.password.trim() &&
      formData.confirmPassword.trim() &&
      formData.password === formData.confirmPassword &&
      (!errors.password || errors.password.length === 0) &&
      (!errors.confirmPassword || errors.confirmPassword.length === 0) &&
      termsAccepted
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: `+${formData.countryCode}${formData.mobile}`,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");

      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userPhone", `+${formData.countryCode}${formData.mobile}`);
      router.push("/sign-up/verify-otp");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/google-signup`,
        { token: credentialResponse.credential },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token, user, expiresIn } = response.data;
      const cookieOptions = {
        expires: expiresIn / 86400,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      };

      Cookies.set("token", token, cookieOptions);
      Cookies.set("expiry", String(Date.now() + expiresIn * 1000), cookieOptions);
      Cookies.set("userEmail", user.email, cookieOptions);
      Cookies.set("userName", user.name, cookieOptions);
      Cookies.set("userId", user._id, cookieOptions);

      toast({ title: "Success", description: "Sign-up successful" });
      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Signup failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setShowGoogleDialog(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Google signup failed",
    });
    setIsLoading(false);
    setShowGoogleDialog(false);
  };

  const CustomGoogleButton = ({ onClick }) => (
    <Button
      variant="ghost"
      className="w-full bg-[#F3F6F8] dark:bg-[#434445] justify-center border dark:border-[#303031] border-[#E7E7EA] font-medium text-[0.875rem] shadow-[0px_6px_16px_rgba(0,0,0,0.04)] py-[20px] hover:bg-[#E9EEF0] dark:hover:bg-[#4d4e4f]"
      onClick={onClick}
      disabled={isLoading}
    >
      <Image
        src="/images/google.svg"
        alt="Google"
        width={20}
        height={20}
        className="mr-2"
      />
      Sign up with Google
    </Button>
  );

  const DummyGoogleButton = () => (
    <Button
      variant="ghost"
      className="w-full bg-[#F3F6F8] dark:bg-[#434445] justify-center border dark:border-[#303031] border-[#E7E7EA] font-medium text-[0.875rem] shadow-[0px_6px_16px_rgba(0,0,0,0.04)] py-[20px] hover:bg-[#E9EEF0] dark:hover:bg-[#4d4e4f]"
      onClick={() => setShowGoogleDialog(true)}
      disabled={isLoading}
    >
      <Image
        src="/images/google.svg"
        alt="Google"
        width={20}
        height={20}
        className="mr-2"
      />
      Sign up with Google
    </Button>
  );

  const handleLegalClick = (e, type) => {
    e.preventDefault();
    setOpenDrawer(type);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <div className="relative min-h-screen flex items-center justify-center px-6 py-16 bg-background">
        <div className={`flex-1 flex items-center justify-center ${isLoading ? "blur-sm" : ""}`}>
          <Card className="w-full max-w-md bg-transparent shadow-none">
            <CardContent className="px-2 py-3">
              <h1 className="text-2xl sm:text-3xl font-semibold mb-3">Sign Up</h1>
              <p className="text-muted-foreground/65 mb-6">Create your account</p>

              <div className="mb-4 flex justify-center">
                <DummyGoogleButton />
              </div>

              <div className="relative mb-6">
                <img src="/images/or.svg" alt="or" className="mx-auto" />
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="countryCode">Code</Label>
                    <Select
                      value={formData.countryCode}
                      onValueChange={handleCountryCodeChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="+91" />
                      </SelectTrigger>
                      <SelectContent className="max-h-96">
                        {countryCodes.map((code) => (
                          <SelectItem key={code.value} value={code.value}>
                            <div className="flex items-center gap-2">
                              <ReactCountryFlag
                                countryCode={code.code}
                                svg
                                style={{ width: "1.5em", height: "1.5em" }}
                              />
                              <span>{code.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter your mobile number"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password?.length > 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Password must include: {errors.password.join(", ")}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword?.length > 0 && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword[0]}</p>
                  )}
                  </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-400 accent-primary"
                    disabled={isLoading}
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600">
                    I agree to the{" "}
                    <button
                      onClick={(e) => handleLegalClick(e, "terms")}
                      className="text-primary hover:underline"
                      disabled={isLoading}
                    >
                      Terms & Conditions
                    </button>{" "}
                    and{" "}
                    <button
                      onClick={(e) => handleLegalClick(e, "privacy")}
                      className="text-primary hover:underline"
                      disabled={isLoading}
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full text-background"
                  disabled={isLoading || !isFormValid()}
                >
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </Button>
              </form>

              <p className="text-center text-sm mt-6 text-[#A6A8B1]">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Log In
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-primary"></div>
          </div>
        )}

        <LegalDrawer
          isOpen={openDrawer === "terms"}
          onClose={() => setOpenDrawer(null)}
          content={termsContent}
        />
        <LegalDrawer
          isOpen={openDrawer === "privacy"}
          onClose={() => setOpenDrawer(null)}
          content={privacyContent}
        />

        <Dialog open={showGoogleDialog} onOpenChange={setShowGoogleDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Continue with Google</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                By continuing with Google, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="pb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                disabled={isLoading}
                render={({ onClick }) => <CustomGoogleButton onClick={onClick} />}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </GoogleOAuthProvider>
  );
}