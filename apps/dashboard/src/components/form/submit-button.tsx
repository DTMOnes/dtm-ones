"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function SubmitButton({
  label,
  isExecuting,
}: {
  label: string;
  isExecuting: boolean;
}) {
  return (
    <Button type="submit" disabled={isExecuting} aria-label="submit">
      {isExecuting ? <Spinner /> : label}
    </Button>
  );
}
