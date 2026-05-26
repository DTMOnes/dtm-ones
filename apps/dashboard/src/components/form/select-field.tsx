"use client";

import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { get } from "react-hook-form";

export default function SelectField({
  name,
  label,
  disabled,
  options,
}: {
  name: string;
  label: string;
  disabled?: boolean;
  options: {
    id: number;
    name: string;
  }[];
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
}
