"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

/** Country option rendered in the dialing-code selector. */
export type PhoneCountry = {
  code: string;
  dialCode: string;
  label: string;
};

const defaultCountries: PhoneCountry[] = [
  { code: "US", dialCode: "+1", label: "United States" },
  { code: "GB", dialCode: "+44", label: "United Kingdom" },
  { code: "CA", dialCode: "+1", label: "Canada" },
  { code: "AU", dialCode: "+61", label: "Australia" },
  { code: "DE", dialCode: "+49", label: "Germany" },
  { code: "FR", dialCode: "+33", label: "France" },
  { code: "IN", dialCode: "+91", label: "India" },
  { code: "JP", dialCode: "+81", label: "Japan" },
];

/** Phone number input with a leading country dialing-code selector. */
export type PhoneInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type"
> & {
  countries?: PhoneCountry[];
  defaultCountry?: string;
  onCountryChange?: (code: string) => void;
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      className,
      countries = defaultCountries,
      defaultCountry,
      onCountryChange,
      ...props
    },
    ref,
  ) => {
    const [country, setCountry] = React.useState(
      defaultCountry ?? countries[0]?.code ?? "",
    );

    return (
      <div
        className={cn(
          "flex h-10 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className,
        )}
      >
        <select
          aria-label="Country dialing code"
          className="h-full rounded-l-md border-0 border-r border-input bg-transparent py-2 pl-3 pr-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed"
          onChange={(event) => {
            setCountry(event.target.value);
            onCountryChange?.(event.target.value);
          }}
          value={country}
        >
          {countries.map((item) => (
            <option key={item.code} value={item.code}>
              {item.dialCode}
            </option>
          ))}
        </select>
        <input
          {...props}
          className="h-full w-full flex-1 rounded-r-md bg-transparent px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed"
          ref={ref}
          type="tel"
        />
      </div>
    );
  },
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
