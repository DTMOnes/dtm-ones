"use client";

import { Controller, get, useFormContext } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SelectField({
  name,
  label,
  disabled,
  placeholder,
  options,
}: {
  name: string;
  label: string;
  disabled?: boolean;
  placeholder?: string;
  options: {
    id: string;
    name: string;
    disabled?: boolean;
  }[];
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = get(errors, name)?.message as string | undefined;

  return (
    <Field className="flex flex-col gap-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={name}
              className="w-full"
              aria-invalid={!!error}
            >
              <SelectValue placeholder={placeholder || label} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.id}
                  value={option.id}
                  disabled={option.disabled}
                >
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <FieldError errors={[{ message: error }]} />}
    </Field>
  );
}
