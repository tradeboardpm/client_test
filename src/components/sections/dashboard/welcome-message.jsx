"use client";

import React from "react";

const getTimeBasedGreeting = (currentTime) => {
  const hour = currentTime.getHours();

  if (hour >= 5 && hour < 12) {
    return "🌤️ Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "☀️ Good afternoon";
  } else {
    return "🌅 Good evening";
  }
};

const WelcomeMessage = ({ userName, currentTime, visible }) => {
    const greeting = getTimeBasedGreeting(currentTime);
    
    const formatTime = (date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

  return (
    <div
      className={`transition-all duration-200 ease-in-out transform w-full flex justify-between ${
        visible
          ? "block opacity-100 translate-y-0"
          : "hidden opacity-0 -translate-y-4 pointer-events-none absolute"
      }`}
    >
      <h2 className="text-xl font-medium">
        {greeting}, {userName}!
      </h2>

      <p className="text-lg font-medium">{formatTime(currentTime)}</p>
    </div>
  );
};

export default WelcomeMessage;
