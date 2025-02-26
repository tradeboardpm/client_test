import React, { useState } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Card } from "./card";

const CustomCalendar = ({ data }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Disable the next button if the currentDate is in the current month and year
  const isCurrentMonth = () => {
    const today = new Date();
    return (
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth()
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    if (!isCurrentMonth()) {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dateString = formatDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const hasData = data && dateString in data;

      let bgColor = "bg-white dark:bg-black text-gray-400 shadow";
      if (hasData) {
        bgColor = data[dateString]
          ? "bg-green-200 text-green-600"
          : "bg-red-200 text-red-600";
      }
      if (isToday) {
        bgColor = "bg-purple-500 text-white";
      }

      days.push(
        <div
          key={day}
          className={`flex items-center justify-center h-8 w-8 rounded-lg ${bgColor}`}
        >
          <span className="text-sm">{day}</span>
        </div>
      );
    }

    return days;
  };

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden p-3">
      <div className="">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-accent">
          <h2 className="text-xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className=" space-x-4">
            <button onClick={prevMonth} className="text-accent-foreground">
              <ChevronsLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextMonth}
              className={`text-accent-foreground ${
                isCurrentMonth() ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isCurrentMonth()}
            >
              <ChevronsRight className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-[0.8rem] font-medium text-accent-foreground mb-1"
            >
              {day}
            </div>
          ))}
          {renderCalendarDays()}
        </div>
      </div>
      <div className="pt-2 border-t mt-2">
        <div className="flex items-center justify-start space-x-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary rounded mr-2 shadow"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-200 rounded mr-2 shadow"></div>
            <span>Profit</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-200 rounded mr-2 shadow"></div>
            <span>Loss</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-white dark:bg-black rounded mr-2 shadow"></div>
            <span>NoTrade</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CustomCalendar;
