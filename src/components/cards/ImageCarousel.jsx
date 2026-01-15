"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  "/images/auth/welcome.png",
  "/images/auth/performance.png",
  "/images/auth/partner.png"
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
      <div className="relative w-full flex-1 overflow-hidden mb-6">
        <div className="flex h-full transition-transform duration-500 ease-in-out"
             style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((src, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full h-full flex items-center justify-center px-2"
            >
              <div className="relative w-full max-w-4xl h-[500px] rounded-3xl overflow-hidden border-[6px] border-black">
                <Image
                  src={src}
                  alt={`Slide ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </div>
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