"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
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
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_RULE_LENGTH = 150;

export const AddRulesDialog = ({
  open,
  onOpenChange,
  selectedDate,
  onRulesAdded,
  isLoading,
  costPerRule = 0.05,
}) => {
  const [rulesList, setRulesList] = useState([""]);
  const [isAddingRules, setIsAddingRules] = useState(false);
  const inputRefs = useRef([]);

  const totalCost = useMemo(() => {
    const validRulesCount = rulesList.filter(
      (rule) => rule.trim() !== ""
    ).length;
    return (validRulesCount * costPerRule).toFixed(2);
  }, [rulesList, costPerRule]);

  useEffect(() => {
    if (!open) {
      setRulesList([""]);
      inputRefs.current = [];
    }
  }, [open]);

  const handleAddRuleInput = () => {
    if (rulesList.length < 10) {
      setRulesList([...rulesList, ""]);
    } else {
      toast({
        title: "Maximum Rules Reached",
        description: "You cannot add more than 10 rules at once.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRuleInput = (index) => {
    const newRulesList = rulesList.filter((_, i) => i !== index);
    setRulesList(newRulesList.length ? newRulesList : [""]);
  };

  const handleRuleChange = (index, value) => {
    const truncatedValue = value.slice(0, MAX_RULE_LENGTH);
    const newRulesList = [...rulesList];
    newRulesList[index] = truncatedValue;
    setRulesList(newRulesList);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter" && rulesList[index].trim() !== "") {
      e.preventDefault();
      if (index === rulesList.length - 1 && rulesList.length < 10) {
        handleAddRuleInput();
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 0);
      } else if (index < rulesList.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleClearAll = () => {
    setRulesList([""]);
  };

  const handleAddRules = async () => {
    const validRules = rulesList.filter((rule) => rule.trim() !== "");

    if (validRules.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one rule.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingRules(true);
    try {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${API_URL}/rules/bulk`,
        {
          rules: validRules.map((description) => ({
            description,
            date: selectedDate.toISOString(),
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onRulesAdded(response.data);
      setRulesList([""]);
      onOpenChange(false);

      toast({
        title: "Rules added",
        description: `${validRules.length} rule(s) have been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding rules:", error);
      toast({
        title: "Error",
        description: "Failed to add rules. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingRules(false);
    }
  };

  const isAddRuleDisabled =
    isAddingRules ||
    rulesList.length >= 10 ||
    rulesList[rulesList.length - 1].trim() === "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className={"border-b pb-2 mb-2"}>
          <DialogTitle className="text-xl mb-1">Add Rules</DialogTitle>
          <DialogDescription className="text-xs">
            Here you can add Rules.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4 max-h-[300px] overflow-y-auto pr-2">
          {rulesList.map((rule, index) => (
            <div key={index} className="flex flex-col space-y-1 p-2">
              <div className="flex items-center space-x-2">
                <Input
                  ref={(el) => {
                    if (el) {
                      inputRefs.current[index] = el;
                    }
                  }}
                  value={rule}
                  onChange={(e) => handleRuleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder="Enter your rule"
                  maxLength={MAX_RULE_LENGTH}
                  className="flex-1 text-sm"
                />
                {rulesList.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRuleInput(index)}
                    disabled={isAddingRules}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {rule.length}/{MAX_RULE_LENGTH}
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={handleAddRuleInput}
          disabled={isAddRuleDisabled}
          className="w-full mt-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Rule
        </Button>
        <DialogFooter className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={handleClearAll}
            disabled={
              isAddingRules || rulesList.every((rule) => rule.trim() === "")
            }
          >
            Clear All
          </Button>
          <Button
            onClick={handleAddRules}
            disabled={
              isAddingRules || rulesList.every((rule) => rule.trim() === "")
            }
          >
            {isAddingRules ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isAddingRules ? "Adding..." : `Add Rules`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};