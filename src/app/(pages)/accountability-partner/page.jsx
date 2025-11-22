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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Trash2 } from "lucide-react";
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
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);

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
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use(
    (config) => {
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await api.get("/accountability-partner");
      if (response.data.success) {
        setPartners(response.data.data || []);
      } else {
        throw new Error(response.data.error || "Failed to fetch partners");
      }
    } catch (error) {
      console.error("Fetch partners error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch partners",
        variant: "destructive",
      });
      setPartners([]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedDetails.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one detail to share",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        relation: formData.relation,
        dataToShare: {
          tradesTaken: selectedDetails.includes("tradesTaken"),
          winRate: selectedDetails.includes("winRate"),
          rulesFollowed: selectedDetails.includes("rulesFollowed"),
          profitLoss: selectedDetails.includes("profitLoss"),
          capital: selectedDetails.includes("capital"),
          currentPoints: selectedDetails.includes("currentPoints"),
        },
      };

      const response = await api.post("/accountability-partner", submitData);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Accountability partner added successfully. They will receive a welcome email.",
        });
        setPartners((prev) => [...prev, response.data.data]);
        resetForm();
      } else {
        throw new Error(response.data.error || "Failed to add partner");
      }
    } catch (error) {
      console.error("Add partner error:", error.message);
      toast({
        title: "Warning",
        description: "Partner added but email notification failed. " + 
                    (error.response?.data?.error || error.message),
        variant: "destructive",
      });
      await fetchPartners();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePartner = async (partnerId) => {
    try {
      const response = await api.delete(`/accountability-partner/${partnerId}`);
      
      if (response.status === 200 && response.data.success) {
        toast({
          title: "Success",
          description: "Accountability partner removed successfully",
        });
        setPartners((prev) => prev.filter((partner) => partner._id !== partnerId));
      } else {
        throw new Error(response.data.error || "Unexpected response from server");
      }
    } catch (error) {
      console.error("Remove partner error:", error.message, error.response?.data);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove partner",
        variant: "destructive",
      });
      await fetchPartners();
    }
  };

  const confirmDeletePartner = (partner) => {
    setPartnerToDelete(partner);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (partnerToDelete) {
      await handleRemovePartner(partnerToDelete._id);
    }
    setDeleteDialogOpen(false);
    setPartnerToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      relation: "",
    });
    setSelectedDetails([]);
  };

  const isSubscriptionActive = Cookies.get("subscription") === "true";

  return (
    <div className="bg-card h-full">
      <div className="flex flex-col lg:flex-row h-full bg-background rounded-t-xl">
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader className='mb-3'>
              <DialogTitle className="text-xl">Accountability Partner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                An Accountability Partner is someone who supports another person
                to keep a commitment or maintain progress on a desired goal.
                They will often be a trusted acquaintance who will regularly ask
                an individual about their progress.
              </p>
              <p>
                Add details of such a person and they will receive a welcome email with a link 
                to view your current week's trading progress. They can access the data anytime 
                by opening the link. You can also choose what details the accountability
                partner can view.
              </p>

              <div className="w-full flex justify-between pt-8">
                <p className="text-sm flex gap-2 items-center p-1 rounded font-bold w-fit px-2">
                  <Info size={16}/>
                  Accountability Partners cannot make any changes to your data or
                  your account.
                </p>
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
                    <SelectTrigger id="relation" className=" border border-accent bg-card dark:bg-accent">
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
                    <MultiSelectorTrigger className="w-full rounded-md  border border-accent bg-card dark:bg-accent shadow-sm p-2">
                      <MultiSelectorInput
                        placeholder="Select details..."
                        className=" text-sm"
                        disabled={!isSubscriptionActive}
                      />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        {detailOptions.map((option) => (
                          <MultiSelectorItem
                            key={option.value}
                            value={option.value}
                            disabled={!isSubscriptionActive}
                          >
                            {option.label}
                          </MultiSelectorItem>
                        ))}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </div>
              </div>
              <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-200 dark:border-blue-900">
                <strong>Note:</strong> Your accountability partner will receive a welcome email 
                with a secure link to view your current week's trading progress. The data 
                shown will always be for the week they access the link.
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={!isSubscriptionActive}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !isSubscriptionActive}
                >
                  {isLoading ? "Adding..." : "Add Partner"}
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
                          {partner.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Added: {new Date(partner.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDeletePartner(partner)}
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
                <div className="text-center flex flex-col items-center justify-center">
                  <img
                    src="/images/no_box.png"
                    alt="no data"
                    className="size-36"
                  />
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Do you really want to delete this accountability partner{" "}
              <span className="font-semibold">
                {partnerToDelete?.name}
              </span>
              ?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              They will no longer be able to access your trading data through their link.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={!isSubscriptionActive}
            >
              No
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={!isSubscriptionActive}
            >
              Yes, Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}