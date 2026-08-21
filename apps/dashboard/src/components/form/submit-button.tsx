"use client";

import { FloppyDiskIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function SubmitButton({
  label,
  isExecuting,
  icon = <FloppyDiskIcon />,
}: {
  label: string;
  isExecuting: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Button type="submit" disabled={isExecuting} aria-label="submit">
      {isExecuting ? (
        <Spinner />
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </Button>
  );
}
