import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";

const FilterPopover = ({
  title,
  min,
  max,
  value,
  onChange,
  open,
  onOpenChange,
  showPercentage = false,
}) => {
  const [tempValue, setTempValue] = useState(value);
  const popoverContentRef = useRef(null);

  const handleDone = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(tempValue);
    onOpenChange(false);
  };

  // Prevent clicks inside the popover from closing it
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  // Handle slider value change while preventing propagation
  const handleSliderChange = (newValue) => {
    setTempValue(newValue);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild className="border-border bg-card">
        <Button
          variant="outline"
          className="w-fit flex items-center gap-2 justify-between text-foreground h-8"
        >
          {title}
          <ChevronDown className="h-4 w-4 text-foreground/65" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4" 
        align="start"
        onClick={handleContentClick}
      >
        <div className="space-y-6" ref={popoverContentRef}>
          <h4 className="font-medium leading-none">{title}</h4>
          <div className="flex flex-col gap-6">
            <div className="relative pt-8 pb-2">
              <SliderPrimitive.Root
                min={min}
                max={max}
                step={1}
                value={tempValue}
                onValueChange={handleSliderChange}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="relative flex w-full touch-none select-none items-center"
              >
                <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
                  <SliderPrimitive.Range className="absolute h-full bg-primary" />
                </SliderPrimitive.Track>
                {tempValue.map(
                  (val, index) =>
                    val !== min &&
                    val !== max && (
                      <div
                        key={index}
                        className="absolute top-[-30px] transform -translate-x-1/2"
                        style={{
                          left: `${((val - min) / (max - min)) * 100}%`,
                        }}
                      >
                        <div className="bg-background border border-primary rounded px-2 py-1 text-xs whitespace-nowrap">
                          {val}
                          {showPercentage && "%"}
                        </div>
                      </div>
                    )
                )}
                {tempValue.map((_, index) => (
                  <SliderPrimitive.Thumb
                    key={index}
                    className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  />
                ))}
              </SliderPrimitive.Root>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {min}
                {showPercentage && "%"}
              </span>
              <span>
                {max}
                {showPercentage && "%"}
              </span>
            </div>
            <Button
              onClick={handleDone}
              className="w-full mt-4 z-10"
              variant="default"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopover;