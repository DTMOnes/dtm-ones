"use client";

import { get, useFormContext } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export default function TextareaField({
  name,
  label,
  placeholder,
  description,
  disabled,
}: {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = get(errors, name)?.message as string | undefined;

  return (
    <Field className="flex flex-col gap-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Textarea
        id={name}
        // Grows with its text (field-sizing: content); no manual resize handle.
        className="min-h-20 resize-none"
        placeholder={placeholder || label}
        disabled={disabled}
        {...register(name)}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {error && <FieldError errors={[{ message: error }]} />}
    </Field>
  );
}
