"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Waves,
  ShieldCheck,
  Users,
  Filter,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CalendarRange,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Constants
const TYPES = [
  { id: 30, name: "Audio Detection", icon: Waves },
  { id: 29, name: "Logo Detection", icon: ShieldCheck },
  { id: 3, name: "Member Declaration", icon: Users },
];

const REFRESH_RATES = [
  { value: 10, label: "10 seconds" },
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
];

// Theme Toggle Component
const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    setIsDarkMode(savedTheme === "dark" || (!savedTheme && prefersDarkMode));
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="bg-background hover:bg-accent"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-blue-600" />
      )}
    </Button>
  );
};

// Filter Bar Component
const FilterBar = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = React.useState(filters);
  const [dateRange, setDateRange] = React.useState({
    from: filters.startDate ? new Date(filters.startDate) : undefined,
    to: filters.endDate ? new Date(filters.endDate) : undefined,
  });

  const handleDateRangeSelect = (range) => {
    const newFilters = {
      ...localFilters,
      startDate: range.from ? range.from.toISOString().split("T")[0] : "",
      endDate: range.to ? range.to.toISOString().split("T")[0] : "",
    };

    setDateRange(range);
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearDateRange = () => {
    const newFilters = {
      ...localFilters,
      startDate: "",
      endDate: "",
    };

    setDateRange({});
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Card className="rounded-lg ">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="text-sm font-semibold  flex items-center">
          Data Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium  mb-2">Device ID</label>
            <Input
              placeholder="Enter Device ID"
              value={localFilters.deviceId || ""}
              onChange={(e) => {
                const newFilters = {
                  ...localFilters,
                  deviceId: e.target.value,
                };
                setLocalFilters(newFilters);
                onFilterChange(newFilters);
              }}
              className="w-full bg-background"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium  mb-2">
              Date Range
            </label>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !dateRange.from &&
                        !dateRange.to &&
                        "text-muted-foreground"
                    )}
                  >
                    <CalendarRange className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "PPP")} - ${format(
                          dateRange.to,
                          "PPP"
                        )}`
                      ) : (
                        format(dateRange.from, "PPP")
                      )
                    ) : (
                      <span>Select Date Range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateRangeSelect}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {(dateRange.from || dateRange.to) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary"
                  onClick={clearDateRange}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Pagination Component
const Pagination = ({ filters, onFilterChange, totalItems }) => {
  const itemsPerPage = filters.limit || 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex items-center justify-between mt-4 ">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onFilterChange({ page: filters.page - 1 })}
        disabled={filters.page === 1}
        className="hover:bg-accent"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      <div className="text-sm text-foreground">
        Page {filters.page} of {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onFilterChange({ page: filters.page + 1 })}
        disabled={filters.page >= totalPages}
        className="hover:accent"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

// Main Dashboard Component
export default function IoTDashboard() {
  const [refreshRate, setRefreshRate] = useState(30);
  const [filters, setFilters] = useState({
    deviceId: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
  });
  const [data, setData] = useState({});
  const [activeType, setActiveType] = useState(30);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/data`, {
          params: { type: activeType, ...filters },
        });
        setData((prev) => ({ ...prev, [activeType]: response.data.data }));
        setTotalItems(response.data.total || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshRate * 1000);
    return () => clearInterval(interval);
  }, [activeType, filters, refreshRate]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle added to the right side */}
          <ThemeToggle />

          <div className="flex space-x-2 bg-muted rounded-lg p-1 border">
            {TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  variant={activeType === type.id ? "default" : "ghost"}
                  onClick={() => setActiveType(type.id)}
                  className={cn(
                    "flex items-center space-x-2",
                    activeType === type.id
                      ? "bg-primary text-black hover:bg-primary/90"
                      : "text-gray-600 hover:bg-gray-200 bg-background"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{type.name}</span>
                </Button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 bg-muted rounded-lg p-1 border">
            <Select
              value={refreshRate.toString()}
              onValueChange={(value) => setRefreshRate(Number(value))}
            >
              <SelectTrigger className="w-[180px] bg-background border-none focus:ring-0">
                <SelectValue placeholder="Refresh Rate">
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {
                        REFRESH_RATES.find((r) => r.value === refreshRate)
                          ?.label
                      }
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {REFRESH_RATES.map((rate) => (
                  <SelectItem key={rate.value} value={rate.value.toString()}>
                    {rate.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same */}
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      <Card className="mt-6 border rounded-lg ">
        <CardContent className="pt-6">
          {data[activeType]?.length ? (
            <>
              <div className="rounded-lg overflow-hidden border">
                <Table>
                  <TableHeader className="bg-primary/25">
                    <TableRow>
                      {Object.keys(data[activeType][0]).map((key) => (
                        <TableHead
                          key={key}
                          className="text-xs font-bold uppercase tracking-wider"
                        >
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, function (str) {
                              return str.toUpperCase();
                            })}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data[activeType].map((row) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-accent/50 transition-colors"
                      >
                        {Object.entries(row).map(([key, value], index) => (
                          <TableCell key={index} className="text-sm">
                            {key === "ts"
                              ? // Format the timestamp without timezone adjustment
                                new Date(value)
                                  .toISOString()
                                  .replace("T", " ")
                                  .split(".")[0]
                              : Array.isArray(value)
                              ? value.join(", ")
                              : value}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Pagination
                filters={filters}
                onFilterChange={handleFilterChange}
                totalItems={totalItems}
              />
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg font-medium mb-2">No Data Available</p>
              <p className="text-sm">
                Select a different data type or adjust your filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
