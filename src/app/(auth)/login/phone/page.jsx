"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import axios from "axios";
import ReactCountryFlag from "react-country-flag";
import countries from "country-telephone-data";

const countryCodes = countries.allCountries.map((country) => ({
  value: country.dialCode,
  label: `${country.name} (+${country.dialCode})`,
  code: country.iso2.toUpperCase(),
}));

export default function LoginPage() {
  const [countryCode, setCountryCode] = useState("91");
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCountryCodeChange = (value) => {
    setCountryCode(value);
  };

  const handleMobileChange = (e) => {
    setMobile(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneNumber = `+${countryCode}${mobile}`;
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login-phone`,
        {
          phone: phoneNumber,
        }
      );
      if (response.status === 200) {
        router.push(
          `/login/phone/verify-otp?phone=${encodeURIComponent(phoneNumber)}`
        );
      } else {
        console.error("Failed to send OTP");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-8 space-y-8">
      <Button
        variant="outline"
        className="mb-8 rounded-full size-10 p-0 absolute left-10 lg:left-32 top-20"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="space-y-2 text-start">
        <h1 className="text-3xl font-semibold">Log in with Mobile Number</h1>
        <p className="text-muted-foreground/65 text-sm">
          Please enter your registered mobile number
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="countryCode">Code</Label>
            <Select
              value={countryCode}
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
              value={mobile}
              onChange={handleMobileChange}
              required
              disabled={isLoading}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full text-background"
          disabled={isLoading}
        >
          {isLoading ? "Sending OTP..." : "Send OTP"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/sign-up" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}