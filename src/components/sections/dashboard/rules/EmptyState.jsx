import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info, Plus, Loader2 } from "lucide-react";

export const EmptyState = ({
  onAddRule,
  onLoadSampleRules,
  isLoading,
  disabled,
}) => {
  return (
    <Card className="h-full shadow-[0px_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0px_8px_20px_rgba(0,0,0,0.32)]">
      <CardHeader>
        <div className="flex items-center w-full gap-2">
          <h2 className="text-xl font-medium">Rules</h2>
          <HoverCard>
            <HoverCardTrigger>
              <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold">Trading Rules</h4>
                <p className="text-sm text-muted-foreground">
                  Define and track your trading rules to maintain better discipline
                  and consistency in your trading strategy. Check rules you've
                  followed for each trading session.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <img src="/images/no_rule.svg" alt="No rules yet" className="mb-6 w-48" />
        <h3 className="text-xl font-semibold mb-2">Get Started!</h3>
        <p className="text-gray-500 mb-6">Please click below to add your trading rules</p>
        <Button
          className="bg-primary hover:primary_gradient text-white mb-4"
          onClick={onAddRule}
          disabled={isLoading || disabled}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add Rules
        </Button>
        <div className="text-gray-400 mb-2">OR</div>
        <Button
          variant="outline"
          className="text-primary hover:bg-primary/10"
          onClick={onLoadSampleRules}
          disabled={isLoading || disabled}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Loading..." : "Load Standard Rules"}
        </Button>
      </CardContent>
    </Card>
  );
};