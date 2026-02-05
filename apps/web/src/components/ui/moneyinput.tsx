"use client";
import { useReducer } from "react";
import { Input } from "./input";

type TextInputProps = {
  name: string;
  placeholder: string;
  value: number;
  setValue: Function;
};

// Brazilian currency config
const moneyFormatter = Intl.NumberFormat("en-US", {
  currency: "USD",
  currencyDisplay: "symbol",
  currencySign: "standard",
  style: "currency",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function MoneyInput(props: TextInputProps) {
  const initialValue = props.value ? moneyFormatter.format(props.value) : "";

  const [value, setValue] = useReducer((_: any, next: string) => {
    const digits = next.replace(/\D/g, "");
    return moneyFormatter.format(Number(digits) / 100);
  }, initialValue);

  function handleChange(realChangeFn: Function, formattedValue: string) {
    const digits = formattedValue.replace(/\D/g, "");
    const realValue = Number(digits) / 100;
    realChangeFn(realValue);
  }

  return (
    <Input
      placeholder={props.placeholder}
      type="text"
      className="h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black shadow-sm"
      onChange={(ev) => {
        setValue(ev.target.value);
        handleChange(props.setValue, ev.target.value);
      }}
      value={value}
    />
  );
}
