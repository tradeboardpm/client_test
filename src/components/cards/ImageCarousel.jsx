"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  "/images/Dashboard.png",
  "/images/analytics.png",
  "/images/ap.png"
];

const captions = [
  "Welcome to Tradeboard",
  "Performance Analytics",
  "Add An Accountability Partner",
];

const descriptions = [
  "Tradeboard assists you to maintain discipline, track performance and achieve consistent results through data-driven decisions.",
  "Unlock powerful insights into your trading performance with detailed analytics. Track, analyze, and optimize your strategy for smarter, more profitable trades!",
  "Record your daily trades and reflections with ease. Keep track of your progress and improve your strategy with a personalized trading journal!",
  "This feature allows you to add someone who can guide and keep track of your trading progress. This is optional but having an accountability partner always pushes you to do your best.",
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleIndicatorClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden pt-8 px-12">
      <div className="flex w-full h-full overflow-x-hidden">
        {images.map((src, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-full h-full transition-transform duration-500"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden flex-1">
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                layout="fill"
                className="rounded-lg p-6"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Indicator Lines */}
      <div className="flex justify-start ml-4 space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleIndicatorClick(index)}
            className={`h-2 w-28 transition-all rounded-full duration-300 ${
              currentIndex === index ? "bg-white" : "bg-gray-300/25 hover:bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Slide Content */}
      <div className="w-full p-4 text-left text-white">
        <h2 className="text-2xl font-bold">{captions[currentIndex]}</h2>
        <p className="mt-2">{descriptions[currentIndex]}</p>
      </div>
    </div>
  );
}
