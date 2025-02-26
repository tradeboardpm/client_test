"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  "/images/Rectangle.png",
  "/images/Rectangle.png",
  "/images/Rectangle.png",
  "/images/Rectangle.png",
];

const captions = [
  "Welcome to Tradeboard! 👋",
  "Manage your trades efficiently",
  "Track your performance",
  "Stay on top of the market",
];

const descriptions = [
  "Tradeboard is your all-in-one platform designed to simplify and enhance your trading experience. Whether you're a beginner or a seasoned trader, our intuitive interface helps you get started quickly and effortlessly.",
  "Take control of your trades with our comprehensive management tools. Organize, analyze, and optimize your trading strategy with real-time insights and easy-to-use tracking features.",
  "Gain deeper insights into your trading performance with our advanced analytics. Visualize your progress, identify strengths and opportunities, and make data-driven decisions to improve your trading results.",
  "Get instant market updates, monitor trends, and make informed decisions with our cutting-edge market tracking tools. Stay ahead of the curve and maximize your trading potential.",
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Manual navigation handler
  const handleIndicatorClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden pt-8 px-12">
      <div className="flex w-full h-full overflow-x-hidden ">
        {images.map((src, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-full h-full transition-transform duration-500 "
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden flex-1  ">
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
              currentIndex === index
                ? "bg-white "
                : "bg-gray-300/25 hover:bg-gray-300"
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
