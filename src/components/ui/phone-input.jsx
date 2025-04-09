import * as React from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const PhoneInput = React.forwardRef((props, ref) => {
  const { className, onChange, ...rest } = props;
  
  return (
    <RPNInput.default
      ref={ref}
      className={cn("flex", className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      smartCaret={false}
      onChange={(value) => onChange?.(value || "")}
      defaultCountry="IN"
      international={false}
      withCountryCallingCode={false}
      {...rest}
    />
  );
});
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef((props, ref) => {
  const { className, ...rest } = props;
  return (
    <Input
      className={cn("rounded-e-lg rounded-s-none", className)}
      {...rest}
      ref={ref}
    />
  );
});
InputComponent.displayName = "InputComponent";

const CountrySelect = ({ disabled, value: selectedCountry, options: countryList, onChange }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="outline"
          className="flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10"
        >
          <FlagComponent
            country={selectedCountry || "IN"}
            countryName={selectedCountry}
          />
          <ChevronsUpDown
            className={cn(
              "-mr-2 size-4 opacity-50",
              disabled ? "hidden" : "opacity-100"
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <ScrollArea className="h-72">
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={(country) => {
                        onChange(country);
                        setOpen(false);
                      }}
                    />
                  ) : null
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
const CountrySelectOption = ({ country, countryName, selectedCountry, onChange }) => {
  return (
    <CommandItem className="gap-2" onSelect={() => onChange(country)}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm text-foreground/50">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <CheckIcon
        className={cn("ml-auto size-4", country === selectedCountry ? "opacity-100" : "opacity-0")}
      />
    </CommandItem>
  );
};

const FlagComponent = ({ country, countryName }) => {
  const Flag = country ? flags[country] : null;
  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

// Custom hook for handling phone input with country code detection
const usePhoneInput = () => {
  const [phone, setPhone] = React.useState("");
  const [country, setCountry] = React.useState("IN");

  const handlePhoneChange = (value) => {
    setPhone(value || "");
    
    // If user manually enters a country code (starting with +), detect and change country
    if (value && value.startsWith('+')) {
      try {
        const countryCode = value.split(' ')[0].slice(1);
        // Find country by calling code
        for (const c of Object.keys(RPNInput.countries)) {
          if (RPNInput.getCountryCallingCode(c) === countryCode) {
            setCountry(c);
            break;
          }
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }
  };

  return {
    phone,
    country,
    setPhone,
    setCountry,
    handleChange: handlePhoneChange
  };
};

export { PhoneInput, usePhoneInput };