import React, { useState } from "react";
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

  const handleDone = () => {
    onChange(tempValue);
    onOpenChange(false);
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
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">{title}</h4>
          <div className="flex flex-col gap-4">
            <div className="relative pt-6">
              <SliderPrimitive.Root
                min={min}
                max={max}
                step={1}
                value={tempValue}
                onValueChange={setTempValue}
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
                        <div className="bg-background border border-primary rounded px-2 py-1 text-xs">
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
            <div className="flex justify-between">
              <span>
                {min}
                {showPercentage && "%"}
              </span>
              <span>
                {max}
                {showPercentage && "%"}
              </span>
            </div>
            <Button onClick={handleDone} className="w-full mt-2">
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopover;
