"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import GoogleSignUpButton from "@/components/buttons/google-signup-button";
import PhoneNumberInput from "@/components/ui/phone-input";
import PrivacyPolicy from "@/app/(misc)/privacy/page";
import TermsOfService from "@/app/(misc)/terms/page";

const countryCodes = [
  { value: "91", label: "India (+91)" },
  { value: "1", label: "United States (+1)" },
  { value: "44", label: "United Kingdom (+44)" },
  { value: "81", label: "Japan (+81)" },
  { value: "86", label: "China (+86)" },
];

const LegalDrawer = ({ isOpen, onClose, content }) => (
  <Drawer open={isOpen} onOpenChange={onClose}>
    <DrawerContent>
      <DrawerHeader>
      </DrawerHeader>
      <div className="p-4 max-h-[70vh] overflow-y-auto">
        <p className="text-sm text-foreground">{content.content}</p>
       <div className="w-full flex items-center justify-end">
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
    setFormData({ ...formData, [id]: value });
    if (id === "password" && validatePassword(value).length === 0) {
      setErrors((prev) => ({ ...prev, password: [] }));
    }
    if (id === "confirmPassword" && value === formData.password) {
      setErrors((prev) => ({ ...prev, confirmPassword: [] }));
    }
  };

  const handleCountryCodeChange = (value) => {
    setFormData({ ...formData, countryCode: value });
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.confirmPassword.trim() !== "" &&
      formData.password === formData.confirmPassword &&
      (!errors.password || errors.password.length === 0) &&
      termsAccepted
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            phone: `+${formData.countryCode}${formData.mobile}`,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem(
        "userPhone",
        `+${formData.countryCode}${formData.mobile}`
      );

      router.push("/sign-up/verify-otp");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/google-signup`,
        {
          token: credentialResponse.credential,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { token, user, expiresIn } = response.data;

      Cookies.set("token", token, {
        expires: expiresIn / 86400,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      Cookies.set("expiry", String(Date.now() + expiresIn * 1000), {
        expires: expiresIn / 86400,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      Cookies.set("userEmail", user.email, {
        expires: expiresIn / 86400,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      Cookies.set("userName", user.name, {
        expires: expiresIn / 86400,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      Cookies.set("userId", user._id, {
        expires: expiresIn / 86400,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      toast({
        title: "Success",
        description: "Sign-up successful",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Google signup error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Signup failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Google signup failed",
    });
  };

  const handleLegalClick = (e, type) => {
    e.preventDefault();
    setOpenDrawer(type);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md bg-transparent shadow-none">
          <CardContent className="px-2 py-3">
            <h1 className="text-3xl font-semibold mb-3">Sign up</h1>
            <p className="text-[#A6A8B1] mb-6">Please create an account</p>

            <div className="w-full flex items-center justify-center mb-4 ">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                disabled={isLoading}
                width={600}
              />
            </div>

            <div className="relative mb-2">
              <img src="/images/or.svg" alt="or" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email ID</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email ID"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <PhoneNumberInput
                  label="Mobile Number"
                  id="phone"
                  value={`+${formData.countryCode}${formData.mobile}`}
                  onChange={(value) => {
                    if (value) {
                      const countryCode = value.slice(1, 3);
                      const mobile = value.slice(3);
                      setFormData((prev) => ({
                        ...prev,
                        countryCode,
                        mobile,
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        countryCode: "91",
                        mobile: "",
                      }));
                    }
                  }}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && errors.password.length > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Missing: {errors.password.join(", ")}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPassword[0]}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 rounded border-2 border-gray-400 cursor-pointer accent-primary"
                />
                <label
                  htmlFor="terms"
                  className="text-xs mt-2 text-gray-600 leading-none cursor-pointer"
                >
                  By creating an account you agree to our{" "}
                  <button
                    onClick={(e) => handleLegalClick(e, "terms")}
                    className="text-primary hover:underline"
                  >
                    Terms & Conditions
                  </button>{" "}
                  and{" "}
                  <button
                    onClick={(e) => handleLegalClick(e, "privacy")}
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </button>
                  .
                </label>
              </div>
              <Button
                className="w-full text-background"
                type="submit"
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? "Signing up..." : "Sign up"}
              </Button>
            </form>

            <p className="text-center text-sm mt-6 text-[#A6A8B1]">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

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
    </GoogleOAuthProvider>
  );
}