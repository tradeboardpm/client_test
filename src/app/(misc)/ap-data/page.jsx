"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchApData } from "@/utils/ap-api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Topbar from "./topbar";

const CustomLegend = ({ items }) => (
  <div className="flex flex-wrap items-center gap-2 ml-4 text-xs text-muted-foreground">
    {items.map((item, index) => (
      <div key={index} className="flex items-center gap-1">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span>{item.label}</span>
      </div>
    ))}
  </div>
);

const RuleItem = ({ rule, count, isFollowed }) => (
  <div className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50">
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{rule}</p>
    </div>
    <div className="flex items-center gap-2">
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          isFollowed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {count}
      </span>
    </div>
  </div>
);

const LEVELS = [
  { name: "Pearl", threshold: 250 },
  { name: "Aquamarine", threshold: 500 },
  { name: "Topaz", threshold: 750 },
  { name: "Opal", threshold: 1000 },
  { name: "Sapphire", threshold: 1250 },
  { name: "Emerald", threshold: 1500 },
  { name: "Ruby", threshold: 1750 },
  { name: "Diamond", threshold: 2000 },
];

function ApDataInner() {
  const [isLoading, setIsLoading] = useState(true);
  const [sharedData, setSharedData] = useState(null);
  const searchParams = useSearchParams();
  const [openFollowedDialog, setOpenFollowedDialog] = useState(false);
  const [openUnfollowedDialog, setOpenUnfollowedDialog] = useState(false);
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      fetchApData(token)
        .then((data) => {
          setSharedData(data);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!sharedData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardContent>
              Unable to fetch shared data. Please try again later.
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const chartData = Object.entries(sharedData.detailed).map(([date, data]) => ({
    date:
      sharedData.dataRange.frequency === "weekly"
        ? new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : date,
    ...data,
  }));

  const determineUpcomingLevel = (currentPoints) => {
    for (const level of LEVELS) {
      if (currentPoints < level.threshold) {
        return level.name;
      }
    }
    return "Diamond";
  };

  return (
  <>
  <Topbar/>
  <div className="lg:px-20 mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Welcome {sharedData.apName},</h1>
        <h1 className="text-xl font-semibold text-muted-foreground opacity-70">
          You are viewing the {sharedData.dataRange.frequency} progress of{" "}
          {sharedData.userName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Shared with you since:{" "}
          {new Date(sharedData.dataSentAt).toLocaleString()}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle className="text-xl">Performance</CardTitle>
          <p className="text-lg font-semibold rounded-lg border-2 text-primary py-1 px-2 w-fit mt-2 sm:mt-0">
            Capital: ₹ {sharedData.overall.capital?.toFixed(2) ?? "N/A"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Trades Taken Chart */}
            <Card className="shadow-lg bg-popover">
              <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">
                  Trades Taken
                </CardTitle>
                <CardDescription className="text-xs">
                  Daily trade count
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ChartContainer
                  config={{
                    trades: {
                      label: "Trades",
                      color: "var(--primary)",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 20, bottom: 10, left: 0 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        stroke="var(--border)"
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="tradesTaken"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ fill: "var(--primary)", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Win Rate Chart */}
            <Card className="shadow-lg bg-popover">
              <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">
                  Win Rate
                </CardTitle>
                <CustomLegend
                  items={[
                    { label: "Win", color: "var(--chart-1)" },
                    { label: "Loss", color: "var(--destructive)" },
                  ]}
                />
              </CardHeader>
              <CardContent className="p-0">
                <ChartContainer
                  config={{
                    win: {
                      label: "Win",
                      color: "var(--chart-1)",
                    },
                    loss: {
                      label: "Loss",
                      color: "var(--destructive)",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 20, bottom: 10, left: 0 }}
                      stackOffset="sign"
                    >
                      <CartesianGrid
                        vertical={false}
                        stroke="var(--border)"
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="winTrades"
                        stackId="a"
                        fill="var(--chart-1)"
                        barSize={20}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="lossTrades"
                        stackId="a"
                        fill="var(--destructive)"
                        barSize={20}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Profit & Loss Chart */}
            <Card className="shadow-lg bg-popover">
              <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">
                  Profit & Loss
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ChartContainer
                  config={{
                    amount: {
                      label: "Amount",
                      color: "var(--primary)",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 20, bottom: 10, left: 0 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        stroke="var(--border)"
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        tickFormatter={(value) =>
                          value >= 0
                            ? `+${(value / 1000).toFixed(0)}K`
                            : `${(value / 1000).toFixed(0)}K`
                        }
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) =>
                              value >= 0
                                ? `+${(value / 1000).toFixed(1)}K`
                                : `${(value / 1000).toFixed(1)}K`
                            }
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="totalProfitLoss"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ fill: "var(--primary)", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Rules Chart */}
            <Card className="shadow-lg bg-popover">
              <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">Rules</CardTitle>
                <CustomLegend
                  items={[
                    { label: "Followed", color: "var(--chart-1)" },
                    { label: "Broken", color: "var(--destructive)" },
                  ]}
                />
              </CardHeader>
              <CardContent className="p-0">
                <ChartContainer
                  config={{
                    followed: {
                      label: "Followed",
                      color: "var(--chart-1)",
                    },
                    broken: {
                      label: "Broken",
                      color: "var(--destructive)",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 20, bottom: 10, left: 0 }}
                      stackOffset="sign"
                    >
                      <CartesianGrid
                        vertical={false}
                        stroke="var(--border)"
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="rulesFollowed"
                        stackId="a"
                        fill="var(--chart-1)"
                        barSize={20}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="rulesUnfollowed"
                        stackId="a"
                        fill="var(--destructive)"
                        barSize={20}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle className="text-xl">Journaling Trends</CardTitle>
          <p className="text-lg font-semibold rounded-lg border-2 text-primary py-1 px-2 w-fit mt-2 sm:mt-0 flex items-center gap-2">
            <span>
              Level:{" "}
              <span className="font-normal">
                {determineUpcomingLevel(sharedData.overall.currentPoints)}
              </span>
            </span>
            <Separator className="h-6" orientation="vertical" />
            <span>
              Current Points:{" "}
              <span className="font-normal">
                {sharedData.overall.currentPoints ?? "N/A"}
              </span>
            </span>
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-popover">
              <CardHeader>
                <CardTitle>On Profitable Days</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <p>
                  Rules you followed: <br />
                  <span className="text-green-600 font-semibold text-lg">
                    {sharedData.overall.profitLossSummary.profit_days.avgRulesFollowed.toFixed(
                      2
                    )}
                    %
                  </span>
                </p>
                <p>
                  Words Journaled: <br />
                  <span className="text-green-600 font-semibold text-lg">
                    {sharedData.overall.profitLossSummary.profit_days.avgWordsJournaled.toFixed(
                      2
                    )}
                  </span>
                </p>
                <p>
                  Trades taken: <br />
                  <span className="text-green-600 font-semibold text-lg">
                    {sharedData.overall.profitLossSummary.profit_days.avgTradesTaken.toFixed(
                      2
                    )}
                  </span>
                </p>
                <p>
                  Win rate: <br />
                  <span className="text-green-600 font-semibold text-lg">
                    {sharedData.overall.profitLossSummary.profit_days.winRate.toFixed(
                      2
                    )}
                    %
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-popover">
              <CardHeader>
                <CardTitle>On Loss Making Days</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <p>
                  Rules you followed: <br />
                  <span className="text-red-600 font-semibold text-lg">
                    {sharedData.overall.profitLossSummary.loss_days.avgRulesFollowed.toFixed(
                      2
                    )}
                    %
                  </span>
                </p>
                <p>
                  Words Journaled: <br />
                  <span className="text-red-600 font-semibold text-lg">
                    {sharedData.overall.profitLossSummary.loss_days.avgWordsJournaled.toFixed(
                      2
                    )}
                  </span>
                </p>
                <p>
                  Trades taken: <br />
                  <span className="text-red-600 font-semibold text-lg">
                    {sharedData.overall.profitLossSummary.loss_days.avgTradesTaken.toFixed(
                      2
                    )}
                  </span>
                </p>
                <p>
                  Win rate: <br />
                  <span className="text-red-600 font-semibold text-lg">
                    {sharedData.overall.profitLossSummary.loss_days.winRate.toFixed(
                      2
                    )}
                    %
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-popover">
              <CardHeader>
                <CardTitle>On Break-Even Days</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <p>
                  Rules you followed: <br />
                  <span className="text-blue-600 font-semibold text-lg">
                    {sharedData.overall.profitLossSummary.breakEven_days.avgRulesFollowed.toFixed(
                      2
                    )}
                    %
                  </span>
                </p>
                <p>
                  Words Journaled: <br />
                  <span className="text-blue-600 font-semibold text-lg">
                    {sharedData.overall.profitLossSummary.breakEven_days.avgWordsJournaled.toFixed(
                      2
                    )}
                  </span>
                </p>
                <p>
                  Trades taken: <br />
                  <span className="text-blue-600 font-semibold text-lg">
                    {sharedData.overall.profitLossSummary.breakEven_days.avgTradesTaken.toFixed(
                      2
                    )}
                  </span>
                </p>
                <p>
                  Win rate: <br />
                  <span className="text-blue-600 font-semibold text-lg">
                    {sharedData.overall.profitLossSummary.breakEven_days.winRate.toFixed(
                      2
                    )}
                    %
                  </span>
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Top Followed Rules Card */}
              <Card
                className="cursor-pointer bg-popover hover:bg-accent flex-1"
                onClick={() => setOpenFollowedDialog(true)}
              >
                <CardHeader>
                  <CardTitle>Top Followed Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="flex flex-col">
                    <span className="text-sm">
                      {sharedData.overall.topFollowedRules[0]?.rule}
                    </span>
                    <span className="text-sm">
                      <span className="text-xl text-green-600 font-semibold">
                        {sharedData.overall.topFollowedRules[0]?.followedCount}
                      </span>{" "}
                      times followed
                    </span>
                  </p>
                </CardContent>
              </Card>

              {/* Top Unfollowed Rules Card */}
              <Card
                className="cursor-pointer bg-popover hover:bg-accent flex-1"
                onClick={() => setOpenUnfollowedDialog(true)}
              >
                <CardHeader>
                  <CardTitle>Top Unfollowed Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="flex flex-col">
                    <span className="text-sm">
                      {sharedData.overall.topUnfollowedRules[0]?.rule}
                    </span>
                    <span className="text-sm">
                      <span className="text-xl text-red-600 font-semibold">
                        {
                          sharedData.overall.topUnfollowedRules[0]
                            ?.unfollowedCount
                        }
                      </span>{" "}
                      times un-followed
                    </span>
                  </p>
                </CardContent>
              </Card>

              {/* Enhanced Dialog for Unfollowed Rules */}
              <Dialog
                open={openUnfollowedDialog}
                onOpenChange={setOpenUnfollowedDialog}
              >
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      All Unfollowed Rules
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 max-h-96 overflow-y-auto pr-2">
                    <div className="space-y-1">
                      {sharedData.overall.topUnfollowedRules.map(
                        (rule, index) => (
                          <RuleItem
                            key={index}
                            rule={rule.rule}
                            count={rule.unfollowedCount}
                            isFollowed={false}
                          />
                        )
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Enhanced Dialog for Followed Rules */}
              <Dialog
                open={openFollowedDialog}
                onOpenChange={setOpenFollowedDialog}
              >
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      All Followed Rules
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 max-h-96 overflow-y-auto pr-2">
                    <div className="space-y-1">
                      {sharedData.overall.topFollowedRules.map(
                        (rule, index) => (
                          <RuleItem
                            key={index}
                            rule={rule.rule}
                            count={rule.followedCount}
                            isFollowed={true}
                          />
                        )
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </>
  );
}

export default function ApData() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <ApDataInner />
    </Suspense>
  );
}