"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { get } from "react-hook-form";

export default function OptionsField({
  name,
  label,
  disabled,
  options,
}: {
  name: string;
  label: string;
  disabled?: boolean;
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
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <ToggleGroup
            type="multiple"
            size="sm"
            variant="outline"
            spacing={2}
            className="flex flex-wrap gap-2"
            disabled={disabled}
            onValueChange={(values) => field.onChange(values)}
            value={field.value}
          >
            {options.map((option) => (
              <ToggleGroupItem key={option.name} value={option.id.toString()}>
                {option.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      />
      {error && <FieldError errors={[{ message: error as string }]} />}
    </Field>
  );
  /*
  return (
    <Field className="flex flex-col gap-2">
      <FieldLabel htmlFor={label}>{label}</FieldLabel>
      <Combobox>
        <ComboboxInput
          type="text"
          id={name}
          placeholder={options.length === 0 ? "No hay opciones" : label}
          autoComplete="off"
          disabled={disabled || options.length === 0}
          {...register(name, {
            onChange: async () => {
              await trigger(name);
            },
          })}
        />
        <ComboboxContent>
          {options.length > 0 ? (
            options.map((option) => (
              <ComboboxItem key={option.id} value={option.id.toString()}>
                {option.name}
              </ComboboxItem>
            ))
          ) : (
            <ComboboxItem key="no-options" value="no-options">
              No se encontraron opciones
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
      {error && <FieldError errors={[{ message: error as string }]} />}
    </Field>
  );
  */
}
