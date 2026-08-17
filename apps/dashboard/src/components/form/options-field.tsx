"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { get } from "react-hook-form";

export default function OptionsField({
  name,
  label,
  disabled,
  options,
  emptyMessage = "No options available yet",
}: {
  name: string;
  label: string;
  disabled?: boolean;
  emptyMessage?: string;
  options: {
    id: string | number;
    name: string;
  }[];
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = get(errors, name)?.message as string | undefined;

  return (
    <Field className="flex flex-col gap-2">
      <FieldLabel htmlFor={label}>{label}</FieldLabel>
      {options.length === 0 ? (
        <Empty className="border">
          <EmptyDescription className="text-xs">
            {emptyMessage}
          </EmptyDescription>
        </Empty>
      ) : (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <ToggleGroup
              type="single"
              size="sm"
              variant="outline"
              spacing={2}
              className="flex flex-wrap gap-2"
              disabled={disabled}
              onValueChange={(value) => field.onChange(value)}
              value={field.value ?? ""}
            >
              {options.map((option) => (
                <ToggleGroupItem key={option.name} value={option.id.toString()}>
                  {option.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      )}
      {error && <FieldError errors={[{ message: error as string }]} />}
    </Field>
  );
}
