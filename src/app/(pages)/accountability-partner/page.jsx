"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreVertical, Package, Trash2 } from "lucide-react";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import { toast } from "@/hooks/use-toast";

export default function AccountabilityPartner() {
  const [partners, setPartners] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [showDialog, setShowDialog] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    relation: "",
    shareFrequency: "weekly",
  });

  const detailOptions = [
    { value: "tradesTaken", label: "No. of Trades taken" },
    { value: "winRate", label: "Win Rate" },
    { value: "rulesFollowed", label: "Rules Followed" },
    { value: "profitLoss", label: "Profit/Loss Chart" },
    { value: "capital", label: "Current Capital" },
    { value: "currentPoints", label: "Current Points" },
  ];

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  api.interceptors.request.use(
    (config) => {
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await api.get("/accountability-partner");
      setPartners(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch partners",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        relation: formData.relation,
        shareFrequency: formData.shareFrequency,
        dataToShare: {
          tradesTaken: selectedDetails.includes("tradesTaken"),
          winRate: selectedDetails.includes("winRate"),
          rulesFollowed: selectedDetails.includes("rulesFollowed"),
          profitLoss: selectedDetails.includes("profitLoss"),
          capital: selectedDetails.includes("capital"),
          currentPoints: selectedDetails.includes("currentPoints"),
        },
      };

      await api.post("/accountability-partner", submitData);

      toast({
        title: "Success",
        description: "Accountability partner added successfully",
      });

      fetchPartners();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add partner",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePartner = async (partnerId) => {
    try {
      await api.delete(`/accountability-partner/${partnerId}`);
      toast({
        title: "Success",
        description: "Accountability partner removed successfully",
      });
      fetchPartners();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove partner",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      relation: "",
      shareFrequency: "weekly",
    });
    setSelectedDetails([]);
  };

  const isSubscriptionActive = Cookies.get("subscription") === "true";

  return (
    <div className="bg-card h-full">
      <div className="flex flex-col lg:flex-row h-full bg-background rounded-t-xl">
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Accountability Partner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                An Accountability Partner is someone who supports another person
                to keep a commitment or maintain progress on a desired goal.
                They will often be a trusted acquaintance who will regularly ask
                an individual about their progress.
              </p>
              <p>
                Add details of such a person and we will share your progress
                with them. You can also choose what details the accountability
                partner can view.
              </p>
              <p className="text-sm text-gray-500">
                Accountability Partners cannot make any changes to your data or
                your account.
              </p>
              <div className="w-full flex justify-end items-end">
                <Button
                  variant="outline"
                  className="text-primary"
                  onClick={() => setShowDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Card className="bg-transparent border-none shadow-none flex-1 lg:flex-[2] h-full">
          <CardHeader>
            <CardTitle className="text-2xl">
              Add Accountability Partner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="name">Full name*</Label>
                  <Input
                    id="name"
                    placeholder="Accountability Partner's full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={!isSubscriptionActive}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="email">Email ID*</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Accountability Partner's Email ID"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={!isSubscriptionActive}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="relation">Relation</Label>
                  <Select
                    value={formData.relation}
                    onValueChange={(value) =>
                      setFormData({ ...formData, relation: value })
                    }
                    disabled={!isSubscriptionActive}
                  >
                    <SelectTrigger id="relation" className="bg-card">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="family">Family Member</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="colleague">Colleague</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="details" className="-mb-4">
                    Select details you want to share*
                  </Label>
                  <MultiSelector
                    values={selectedDetails}
                    onValuesChange={setSelectedDetails}
                    className="w-full -mt-2 h-fit"
                    disabled={!isSubscriptionActive}
                  >
                    <MultiSelectorTrigger className="w-full rounded-md bg-card border border-input/25 shadow-sm p-2">
                      <MultiSelectorInput
                        placeholder="Select details..."
                        className="bg-card text-sm"
                      />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        {detailOptions.map((option) => (
                          <MultiSelectorItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </MultiSelectorItem>
                        ))}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </div>
              </div>
              <div>
                <Label>Share my progress*</Label>
                <RadioGroup
                  value={formData.shareFrequency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, shareFrequency: value })
                  }
                  className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                  disabled={!isSubscriptionActive}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Monthly</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="text-sm text-gray-500">
                Your accountability partner will receive progress analysis
                starting from today.
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !isSubscriptionActive}>
                  {isLoading ? "Adding..." : "Add"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-none border-none shadow-none flex-1 h-full bg-[#F3EFFA] dark:bg-[#2a292b] mt-4 lg:mt-0">
          <CardHeader>
            <CardTitle className="text-2xl">
              My Accountability Partners
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            {partners.length > 0 ? (
              <div className="space-y-4">
                {partners.map((partner) => (
                  <Card key={partner._id}>
                    <CardContent className="flex justify-between items-center p-4">
                      <div>
                        <h3 className="font-semibold">{partner.name}</h3>
                        <p className="text-sm text-gray-500">
                          Last updated:{" "}
                          {new Date(partner.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePartner(partner._id)}
                        disabled={!isSubscriptionActive}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center  flex flex-col items-center justify-center ">
                  {/* <Package className="mx-auto h-12 w-12 text-gray-400" /> */}
                  <img
                    src="/images/no_box.png"
                    alt="no data"
                    className="size-36"
                  />
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">
                    No Data
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Please add your first Accountability Partner
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}