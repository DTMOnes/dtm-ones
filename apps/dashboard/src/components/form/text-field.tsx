"use client";

import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { get } from "react-hook-form";

export default function TextField({
  name,
  label,
  placeholder,
  disabled,
}: {
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext();

  const error = get(errors, name)?.message as string | undefined;

  return (
    <Field className="flex flex-col gap-2">
      <FieldLabel htmlFor={label}>{label}</FieldLabel>
      <Input
        type="text"
        id={name}
        placeholder={placeholder || label}
        autoComplete="off"
        disabled={disabled}
        {...register(name, {
          onChange: async () => {
            await trigger(name);
          },
        })}
      />
      {error && <FieldError errors={[{ message: error as string }]} />}
    </Field>
  );
}
