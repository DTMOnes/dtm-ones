"use client";

// Next
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Styles
import styles from "./styles.module.scss";

// Components
import { useHeaderOverride } from "@/components/Header/HeaderProvider";

export type FilterItem = {
  id: string;
  name: string;
};

function CategoriesFilters({
  items,
  param = "c",
  label = "Categories",
  name = "filter",
}: {
  items: FilterItem[];
  param?: string;
  label?: string;
  name?: string;
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startRosterTransition } = useHeaderOverride();
  const selected = searchParams.get(param);

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (selected === id) {
      params.delete(param);
    } else {
      params.set(param, id);
    }
    const next = `${pathname}?${params.toString()}`;
    startRosterTransition(() => {
      replace(next);
    });
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(param);
    const next = `${pathname}?${params.toString()}`;
    startRosterTransition(() => {
      replace(next);
    });
  };

  return (
    <div className={styles.container}>
      <p className={styles.meta}>{label}</p>

      <div className={styles.categories}>
        {items.map((item) => (
          <label key={item.id} htmlFor={`${name}-${item.id}`}>
            <input
              type="radio"
              id={`${name}-${item.id}`}
              name={name}
              checked={selected === item.id}
              onChange={() => handleSelect(item.id)}
            />
            <span>{item.name}</span>
          </label>
        ))}
      </div>

      <p className={styles.meta} onClick={handleClear}>
        Clear
      </p>
    </div>
  );
}

function SectionsFilters({
  items,
  name = "section",
  value,
  onChange,
}: {
  items: FilterItem[];
  name?: string;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className={styles.sections}>
      <div className={styles.categories}>
        {items.map((item) => (
          <label key={item.id} htmlFor={`${name}-${item.id}`}>
            <input
              type="radio"
              id={`${name}-${item.id}`}
              name={name}
              checked={value === item.id}
              onChange={() => onChange(item.id)}
            />
            <span>{item.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function Filters(
  props:
    | {
        items: FilterItem[];
        variant?: "categories";
        param?: string;
        label?: string;
        name?: string;
      }
    | {
        items: FilterItem[];
        variant: "sections";
        name?: string;
        value: string;
        onChange: (id: string) => void;
      },
) {
  if (props.variant === "sections") {
    return (
      <SectionsFilters
        items={props.items}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
      />
    );
  }

  return (
    <CategoriesFilters
      items={props.items}
      param={props.param}
      label={props.label}
      name={props.name}
    />
  );
}
