"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info, SquarePen, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AddRulesDialog } from "@/components/dialogs/rules/AddRulesDialog";
import { EmptyState } from "./EmptyState";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_RULE_LENGTH = 150;

export function RulesSection({ selectedDate, onUpdate, onRulesChange }) {
  const [rules, setRules] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRule, setEditingRule] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [newRulesDialog, setNewRulesDialog] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState({
    addRule: false,
    editRule: false,
    deleteRule: false,
    followRule: false,
    followAllRules: false,
    loadSampleRules: false,
  });

  useEffect(() => {
    // Check subscription status from cookies
    const subscriptionStatus = Cookies.get('subscription') === 'true';
    setHasSubscription(subscriptionStatus);
    fetchRules();
  }, [selectedDate]);

  const fetchRules = async () => {
    setIsLoadingRules(true);
    try {
      const token = Cookies.get("token");
      const response = await axios.get(`${API_URL}/rules`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: selectedDate.toISOString() },
      });

      const rulesWithFollowStatus = response.data.map((rule) => ({
        ...rule,
        isFollowed: rule.isFollowed || false,
      }));

      setRules(rulesWithFollowStatus);
    } catch (error) {
      console.error("Error fetching rules:", error);
      toast({
        title: "Error",
        description: "Failed to fetch rules. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRules(false);
    }
  };

  const handleAddRules = (newRules) => {
    setRules((prevRules) => [...prevRules, ...newRules]);
  };

  const handleEditRule = async () => {
    if (!editingRule || !hasSubscription) return;

    setIsLoadingAction((prev) => ({ ...prev, editRule: true }));
    try {
      const token = Cookies.get("token");
      await axios.patch(
        `${API_URL}/rules/${editingRule._id}`,
        {
          description: editingRule.description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRules((prevRules) =>
        prevRules.map((rule) =>
          rule._id === editingRule._id
            ? { ...rule, description: editingRule.description }
            : rule
        )
      );

      setEditingRule(null);
      toast({
        title: "Rule updated",
        description: "Your rule has been updated successfully.",
      });
    } catch (error) {
      console.error("Error editing rule:", error);
      toast({
        title: "Error",
        description: "Failed to update the rule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAction((prev) => ({ ...prev, editRule: false }));
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!hasSubscription) return;

    setIsLoadingAction((prev) => ({ ...prev, deleteRule: true }));
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_URL}/rules/${ruleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRules((prevRules) => prevRules.filter((rule) => rule._id !== ruleId));

      setIsDeleteDialogOpen(false);
      setRuleToDelete(null);
      toast({
        title: "Rule deleted",
        description: "Your rule has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast({
        title: "Error",
        description: "Failed to delete the rule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAction((prev) => ({ ...prev, deleteRule: false }));
    }
  };

  const handleToggleRuleFollow = async (ruleId, isFollowed) => {
    if (!hasSubscription) return;

    setIsLoadingAction((prev) => ({ ...prev, followRule: true }));
    try {
      const token = Cookies.get("token");
      await axios.post(
        `${API_URL}/rules/follow-unfollow`,
        {
          ruleId,
          date: selectedDate.toISOString(),
          isFollowed: !isFollowed,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRules((prevRules) =>
        prevRules.map((rule) =>
          rule._id === ruleId ? { ...rule, isFollowed: !isFollowed } : rule
        )
      );

      onRulesChange?.();

      toast({
        title: `Rule ${isFollowed ? "unfollowed" : "followed"}`,
        description: `The rule has been ${
          isFollowed ? "unfollowed" : "followed"
        } successfully.`,
      });
    } catch (error) {
      console.error("Error following/unfollowing rule:", error);
      toast({
        title: "Error",
        description: "Failed to update the rule status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAction((prev) => ({ ...prev, followRule: false }));
    }
  };

  const handleFollowUnfollowAll = async (isFollowed) => {
    if (!hasSubscription) return;

    setIsLoadingAction((prev) => ({ ...prev, followAllRules: true }));
    try {
      const token = Cookies.get("token");
      await axios.post(
        `${API_URL}/rules/follow-unfollow-all`,
        {
          date: selectedDate.toISOString(),
          isFollowed,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRules((prevRules) =>
        prevRules.map((rule) => ({ ...rule, isFollowed }))
      );
      onRulesChange?.();

      toast({
        title: `All rules ${isFollowed ? "followed" : "unfollowed"}`,
        description: `All rules have been ${
          isFollowed ? "followed" : "unfollowed"
        } successfully.`,
      });
    } catch (error) {
      console.error("Error following/unfollowing all rules:", error);
      toast({
        title: "Error",
        description: "Failed to update all rules. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAction((prev) => ({ ...prev, followAllRules: false }));
    }
  };

  const handleLoadSampleRules = async () => {
    if (!hasSubscription) return;

    setIsLoadingAction((prev) => ({ ...prev, loadSampleRules: true }));
    try {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${API_URL}/rules/load-sample`,
        {
          date: selectedDate.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRules(response.data);

      toast({
        title: "Sample rules loaded",
        description: "Standard trading rules have been loaded successfully.",
      });
    } catch (error) {
      console.error("Error loading sample rules:", error);
      toast({
        title: "Error",
        description: "Failed to load sample rules. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAction((prev) => ({ ...prev, loadSampleRules: false }));
    }
  };

  const filteredRules = rules.filter((rule) =>
    rule.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingRules) {
    return (
      <Card className="w-full max-w-4xl h-full mx-auto p-4 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <span>Loading rules...</span>
        </div>
      </Card>
    );
  }

  if (rules.length === 0) {
    return (
      <>
        <EmptyState
          onAddRule={() => hasSubscription && setNewRulesDialog(true)}
          onLoadSampleRules={handleLoadSampleRules}
          isLoading={isLoadingAction.loadSampleRules}
          disabled={!hasSubscription}
        />
        <AddRulesDialog
          open={newRulesDialog}
          onOpenChange={setNewRulesDialog}
          selectedDate={selectedDate}
          onRulesAdded={handleAddRules}
          isLoading={isLoadingAction.addRule}
        />
      </>
    );
  }

  return (
    <Card className="w-full h-full mx-auto p-4 flex-1 shadow-[0px_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0px_8px_20px_rgba(0,0,0,0.32)]">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-medium">Rules</CardTitle>
            <HoverCard>
              <HoverCardTrigger>
                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold">Trading Rules</h4>
                  <p className="text-sm text-muted-foreground">
                    Define and track your trading rules to maintain better
                    discipline and consistency in your trading strategy. Check
                    rules you've followed for each trading session.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          <div className="flex space-x-2 items-center">
            <div className="relative flex grow max-w-[10.25rem] mr-2 text-xs">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Search rules"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 pl-8 text-xs h-fit"
              />
            </div>

            <Button
              className="bg-primary h-fit text-white text-xs px-3 hover:bg-purple-600"
              onClick={() => setNewRulesDialog(true)}
              disabled={isLoadingAction.addRule || !hasSubscription}
            >
              {isLoadingAction.addRule ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Rules
            </Button>

            <AddRulesDialog
              open={newRulesDialog}
              onOpenChange={setNewRulesDialog}
              selectedDate={selectedDate}
              onRulesAdded={handleAddRules}
              isLoading={isLoadingAction.addRule}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 mt-3">
        <div className="rounded-lg overflow-hidden border">
          <div className="sticky top-0 z-10 grid grid-cols-[auto,1fr,auto] gap-4 p-2 px-4 bg-[#F4E4FF] dark:bg-[#49444c] border-b">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={
                  filteredRules.length > 0 &&
                  filteredRules.every((rule) => rule.isFollowed)
                }
                onChange={(e) => handleFollowUnfollowAll(e.target.checked)}
                disabled={isLoadingAction.followAllRules || !hasSubscription}
                className="w-3.5 h-3.5 cursor-pointer accent-purple-600"
              />
            </div>
            <span className="font-medium">Select Followed Rules</span>
            <span className="font-medium text-right">Action</span>
          </div>
          <div className="max-h-[55vh] min-h-96 overflow-y-auto">
            <div className="divide-y">
              {filteredRules.map((rule) => (
                <div
                  key={rule._id}
                  className="grid grid-cols-[auto,1fr,auto] gap-4 px-4 py-2 items-center hover:bg-secondary/50"
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={rule.isFollowed}
                      onChange={() =>
                        handleToggleRuleFollow(rule._id, rule.isFollowed)
                      }
                      disabled={isLoadingAction.followRule || !hasSubscription}
                      className="w-3.5 h-3.5 cursor-pointer accent-primary hover:border-ring"
                    />
                  </div>
                  <span className="text-secondary-foreground text-[0.8rem]">
                    {rule.description}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => hasSubscription && setEditingRule(rule)}
                      disabled={isLoadingAction.editRule || !hasSubscription}
                      className="p-0 w-fit text-gray-500/35 dark:text-gray-400 hover:text-purple-500 size-5"
                    >
                      <SquarePen className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (hasSubscription) {
                          setRuleToDelete(rule);
                          setIsDeleteDialogOpen(true);
                        }
                      }}
                      disabled={isLoadingAction.deleteRule || !hasSubscription}
                      className="p-0 w-fit text-gray-500/35 dark:text-gray-400 hover:text-red-500 size-5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
        <DialogContent>
          <DialogHeader className={"border-b pb-2 mb-2"}>
            <DialogTitle className="text-xl mb-1">Edit Rule</DialogTitle>
            <DialogDescription className="text-xs">
              Here you can edit your rules.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-1 mb-4 text-sm">
            <p>Rule:</p>
            <Input
              value={editingRule?.description || ""}
              onChange={(e) =>
                setEditingRule(
                  editingRule
                    ? {
                        ...editingRule,
                        description: e.target.value.slice(0, MAX_RULE_LENGTH),
                      }
                    : null
                )
              }
              placeholder="Enter your rule"
              maxLength={MAX_RULE_LENGTH}
              disabled={!hasSubscription}
            />
            <div className="text-xs text-muted-foreground text-right">
              {editingRule?.description.length || 0}/{MAX_RULE_LENGTH}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingRule(null)}
              disabled={isLoadingAction.editRule}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditRule}
              disabled={
                isLoadingAction.editRule ||
                !editingRule?.description.trim() ||
                editingRule.description ===
                  rules.find((r) => r._id === editingRule._id)?.description ||
                !hasSubscription
              }
            >
              {isLoadingAction.editRule ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoadingAction.editRule ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader className={"border-b pb-2 mb-2"}>
            <DialogTitle className="text-xl mb-1">Delete Rule</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete this rule permanently?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-1 mb-4 text-sm">
            <p>Rule:</p>
            <Input
              value={ruleToDelete?.description || ""}
              readOnly
              className="bg-secondary cursor-not-allowed"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoadingAction.deleteRule}
            >
              Cancel
            </Button>
            <Button
              variant=""
              onClick={() => handleDeleteRule(ruleToDelete?._id || "")}
              disabled={isLoadingAction.deleteRule || !hasSubscription}
            >
              {isLoadingAction.deleteRule ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoadingAction.deleteRule ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}