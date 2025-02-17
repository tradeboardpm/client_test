"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Phone } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PhoneNumberInput = React.forwardRef(
  ({ label, value, onChange, error, required, className, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", className)} dir="ltr">
        {label && (
          <Label className="text-sm font-medium" htmlFor={props.id}>
            {label}
          </Label>
        )}
        <RPNInput.default
          ref={ref}
          className="flex rounded-md shadow-sm"
          international
          defaultCountry="IN"
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={PhoneInput}
          value={value || ""}
          onChange={onChange}
          required={required}
          {...props}
        />
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);

PhoneNumberInput.displayName = "PhoneNumberInput";

const PhoneInput = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Input
      className={cn(
        "rounded-l-none border-l-0 pl-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

PhoneInput.displayName = "PhoneInput";

const CountrySelect = ({ disabled, value, onChange, options }) => {
  return (
    <Select disabled={disabled} value={value || "IN"} onValueChange={onChange}>
      <SelectTrigger className="w-[100px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
        <SelectValue>
          <div className="flex items-center gap-2">
            <FlagComponent
              country={value || "IN"}
              countryName={value || "India"}
            />
            <span className="text-sm">
              +{RPNInput.getCountryCallingCode(value || "IN")}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value || option.label}>
            <div className="flex items-center gap-2">
              <FlagComponent
                country={option.value || ""}
                countryName={option.label || ""}
              />
              <span className="text-sm">
                {option.label} (+
                {RPNInput.getCountryCallingCode(option.value || "IN")})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const FlagComponent = ({ country, countryName }) => {
  const Flag = flags[country];
  return (
    <span className="w-5 overflow-hidden rounded-sm">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

export default PhoneNumberInput;


// "use client";

// import * as React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { cn } from "@/lib/utils";
// import { Phone } from "lucide-react";
// import * as RPNInput from "react-phone-number-input";
// import flags from "react-phone-number-input/flags";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const PhoneNumberInput = React.forwardRef(
//   ({ label, value, onChange, error, required, className, ...props }, ref) => {
//     const [country, setCountry] = React.useState("IN");

//     // Custom onChange handler to prevent automatic country detection
//     const handleChange = (newValue) => {
//       if (newValue) {
//         // Strip any existing country code and plus sign
//         const numberOnly = newValue.replace(/^\+\d+/, "").trim();
//         // Construct the new value with the selected country code
//         const formattedValue = `+${RPNInput.getCountryCallingCode(
//           country
//         )}${numberOnly}`;
//         onChange(formattedValue);
//       } else {
//         onChange(newValue);
//       }
//     };

//     return (
//       <div className={cn("space-y-2", className)} dir="ltr">
//         {label && (
//           <Label className="text-sm font-medium" htmlFor={props.id}>
//             {label}
//           </Label>
//         )}
//         <RPNInput.default
//           ref={ref}
//           className="flex rounded-md shadow-sm"
//           international
//           country={country}
//           defaultCountry="IN"
//           flagComponent={FlagComponent}
//           countrySelectComponent={(selectProps) => (
//             <CountrySelect {...selectProps} onCountryChange={setCountry} />
//           )}
//           inputComponent={PhoneInput}
//           value={value || ""}
//           onChange={handleChange}
//           required={required}
//           withCountryCallingCode={false}
//           smartCaret={false}
//           countryCallingCodeEditable={false}
//           autoComplete="tel"
//           {...props}
//         />
//         {error && <p className="text-sm text-destructive mt-1">{error}</p>}
//       </div>
//     );
//   }
// );

// PhoneNumberInput.displayName = "PhoneNumberInput";

// const PhoneInput = React.forwardRef(({ className, ...props }, ref) => {
//   // Remove any country code and plus sign from the input value
//   const inputValue = props.value?.replace(/^\+\d+/, "") || "";

//   return (
//     <Input
//       className={cn(
//         "rounded-l-none border-l-0 pl-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0",
//         className
//       )}
//       ref={ref}
//       {...props}
//       value={inputValue}
//       type="tel"
//     />
//   );
// });

// PhoneInput.displayName = "PhoneInput";

// const CountrySelect = ({
//   disabled,
//   value,
//   onChange,
//   options,
//   onCountryChange,
// }) => {
//   const handleChange = (newCountry) => {
//     onChange(newCountry);
//     if (onCountryChange) {
//       onCountryChange(newCountry);
//     }
//   };

//   return (
//     <Select
//       disabled={disabled}
//       value={value || "IN"}
//       onValueChange={handleChange}
//     >
//       <SelectTrigger className="w-[100px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
//         <SelectValue>
//           <div className="flex items-center gap-2">
//             <FlagComponent
//               country={value || "IN"}
//               countryName={value || "India"}
//             />
//             <span className="text-sm">
//               +{RPNInput.getCountryCallingCode(value || "IN")}
//             </span>
//           </div>
//         </SelectValue>
//       </SelectTrigger>
//       <SelectContent className="max-h-[300px]">
//         {options.map((option) => (
//           <SelectItem key={option.value} value={option.value || option.label}>
//             <div className="flex items-center gap-2">
//               <FlagComponent
//                 country={option.value || ""}
//                 countryName={option.label || ""}
//               />
//               <span className="text-sm">
//                 {option.label} (+
//                 {RPNInput.getCountryCallingCode(option.value || "IN")})
//               </span>
//             </div>
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// };

// const FlagComponent = ({ country, countryName }) => {
//   const Flag = flags[country];
//   return (
//     <span className="w-5 overflow-hidden rounded-sm">
//       {Flag && <Flag title={countryName} />}
//     </span>
//   );
// };

// export default PhoneNumberInput;
