"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import PrivacyPolicy from "@/app/(misc)/privacy/page";
import TermsOfService from "@/app/(misc)/terms/page";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Image from "next/image";
import { PhoneInput, usePhoneInput } from "@/components/ui/phone-input";

// Maximum character limits
const MAX_CHARS = {
  fullName: 30,
  email: 50,
  phone: 15,
  password: 15,
};

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

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({
    fullName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Phone input hook
  const { phone, country, handleChange: handlePhoneChange } = usePhoneInput();

  // Validation function
  const validateField = useCallback((field, value) => {
    const errors = [];
    switch (field) {
      case "fullName":
        if (!value.trim()) errors.push("Full name is required");
        if (value.length > MAX_CHARS.fullName) errors.push(`Max ${MAX_CHARS.fullName} characters allowed`);
        break;
      case "email":
        if (!value.trim()) errors.push("Email is required");
        if (value.length > MAX_CHARS.email) errors.push(`Max ${MAX_CHARS.email} characters allowed`);
        if (!/\S+@\S+\.\S+/.test(value)) errors.push("Invalid email format");
        break;
      case "phone":
        if (!value.trim()) errors.push("Phone number is required");
        // First strip all non-digit characters to count only actual digits
        const digitOnlyPhone = value.replace(/\D/g, "");
        if (digitOnlyPhone.length > MAX_CHARS.phone) errors.push(`Max ${MAX_CHARS.phone} digits allowed`);
        if (digitOnlyPhone.length < 6) errors.push("Phone number too short (min 6 digits)");
        break;
      case "password":
        if (!value.trim()) errors.push("Password is required");
        if (value.length > MAX_CHARS.password) errors.push(`Max ${MAX_CHARS.password} characters allowed`);
        if (value.length < 8) errors.push("8+ characters");
        if (!/[A-Z]/.test(value)) errors.push("uppercase");
        if (!/[a-z]/.test(value)) errors.push("lowercase");
        if (!/\d/.test(value)) errors.push("number");
        if (!/[!@#$%^&*]/.test(value)) errors.push("symbol");
        break;
      case "confirmPassword":
        if (!value.trim()) errors.push("Confirm password is required");
        if (value !== formData.password) errors.push("Passwords don't match");
        break;
      default:
        break;
    }
    return errors;
  }, [formData.password]);

  // Check if form is valid
  useEffect(() => {
    const validateForm = () => {
      const allFields = { 
        fullName: formData.fullName,
        email: formData.email,
        phone: phone || "",
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };
      
      // Check if all required fields have values
      const allFieldsFilled = Object.entries(allFields).every(([key, value]) => 
        value && value.trim() !== ""
      );
      
      // Check if any validation errors exist
      const allErrors = Object.keys(allFields).reduce((acc, key) => {
        acc[key] = validateField(key, allFields[key]);
        return acc;
      }, {});
      
      setErrors(allErrors);
      
      // Form is valid if all fields are filled, no errors exist, and terms are accepted
      const hasNoErrors = Object.values(allErrors).every(err => err.length === 0);
      const isFormValid = allFieldsFilled && hasNoErrors && termsAccepted;
      
      setIsValid(isFormValid);
    };
    
    validateForm();
  }, [formData, phone, termsAccepted, validateField]);

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    const trimmedValue = value.slice(0, MAX_CHARS[id] || value.length);
    
    // Mark field as touched
    if (!touchedFields[id]) {
      setTouchedFields(prev => ({ ...prev, [id]: true }));
    }
    
    setFormData(prev => ({ ...prev, [id]: trimmedValue }));

    // Only validate the field, don't show toast while typing
    const fieldErrors = validateField(id, trimmedValue);
    setErrors(prev => {
      const newErrors = { ...prev, [id]: fieldErrors };
      // Re-validate confirmPassword if password changes
      if (id === "password" && touchedFields.confirmPassword) {
        newErrors.confirmPassword = validateField("confirmPassword", formData.confirmPassword);
      }
      return newErrors;
    });
  }, [validateField, formData.confirmPassword, touchedFields]);

  const handlePhoneInputChange = useCallback((value) => {
    // First, check if adding this value would exceed our digit limit
    const digitOnlyPhone = value.replace(/\D/g, "");
    
    // Only update if within limit or if deleting
    if (digitOnlyPhone.length <= MAX_CHARS.phone || (phone && value.length < phone.length)) {
      handlePhoneChange(value);
      
      // Mark phone field as touched
      if (!touchedFields.phone) {
        setTouchedFields(prev => ({ ...prev, phone: true }));
      }
      
      const phoneErrors = validateField("phone", value || "");
      setErrors(prev => ({ ...prev, phone: phoneErrors }));
    } else {
      // Optional: Show toast about exceeding limit
      toast({
        title: "Input Limit",
        description: `Phone number cannot exceed ${MAX_CHARS.phone} digits`,
        variant: "destructive",
      });
    }
  }, [handlePhoneChange, validateField, touchedFields, phone, toast]);

  const handleBlur = useCallback((fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    
    let value;
    if (fieldName === 'phone') {
      value = phone || "";
    } else {
      value = formData[fieldName];
    }
    
    const fieldErrors = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: fieldErrors }));
    
    // Show toast only on blur and only if there are errors
    if (fieldErrors.length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: fieldErrors[0],
      });
    }
  }, [validateField, toast, formData, phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(touchedFields).reduce(
      (acc, field) => ({ ...acc, [field]: true }), {}
    );
    setTouchedFields(allTouched);
    
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Form Error",
        description: "Please fix all errors before submitting",
      });
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: `+${phone.replace(/\D/g, "")}`, // Just use the phone number without country code prefix
          password: formData.password,
        }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");
  
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userPhone", `+${phone.replace(/\D/g, "")}`);
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

      const { token, user, expiresIn, isNewUser } = response.data;
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

      if (isNewUser) {
        localStorage.setItem("isFirstTimeLogin", "true");
      } else {
        localStorage.setItem("isFirstTimeLogin", "false");
      }

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
    }
  };

  const handleGoogleError = () => {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Google signup failed",
    });
    setIsLoading(false);
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
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  disabled={isLoading}
                  render={({ onClick }) => <CustomGoogleButton onClick={onClick} />}
                />
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
                    onBlur={() => handleBlur("fullName")}
                    maxLength={MAX_CHARS.fullName}
                    required
                    disabled={isLoading}
                  />
                  {touchedFields.fullName && errors.fullName?.length > 0 && (
                    <p className="text-xs text-red-500 mt-1">{errors.fullName[0]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    maxLength={MAX_CHARS.email}
                    required
                    disabled={isLoading}
                  />
                  {touchedFields.email && errors.email?.length > 0 && (
                    <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <PhoneInput
                    id="phone"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={handlePhoneInputChange}
                    onBlur={() => handleBlur("phone")}
                    required
                    disabled={isLoading}
                  />
                  {touchedFields.phone && errors.phone?.length > 0 && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone[0]}</p>
                  )}
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
                      onBlur={() => handleBlur("password")}
                      maxLength={MAX_CHARS.password}
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
                  {touchedFields.password && errors.password?.length > 0 && (
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
                      onBlur={() => handleBlur("confirmPassword")}
                      maxLength={MAX_CHARS.password}
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
                  {touchedFields.confirmPassword && errors.confirmPassword?.length > 0 && (
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
                  disabled={isLoading || !isValid}
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
      </div>
    </GoogleOAuthProvider>
  );
}