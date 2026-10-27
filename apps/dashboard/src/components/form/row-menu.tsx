"use client";

import { DotsThreeIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";

/** The "⋯" menu on a list row (career, award, video): Edit opens its form, Delete removes it. */
export function RowMenu({
  label,
  busy,
  onEdit,
  onDelete,
}: {
  label: string;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={busy}
          aria-label={`${label} options`}
        >
          {busy ? <Spinner /> : <DotsThreeIcon className="size-5" weight="bold" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEdit}>
          <PencilSimpleIcon />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <TrashIcon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
