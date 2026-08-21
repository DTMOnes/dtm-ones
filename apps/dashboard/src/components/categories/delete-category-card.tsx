"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { TrashIcon } from "@phosphor-icons/react";

import { deleteCategoryAction } from "@/actions/categories/deleteCategory";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DeleteCategoryCardProps = {
  categoryId: string;
  categoryName: string;
  playerCount: number;
};

export function DeleteCategoryCard({
  categoryId,
  categoryName,
  playerCount,
}: DeleteCategoryCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isDisabled = playerCount > 0;

  const { executeAsync, isExecuting } = useAction(deleteCategoryAction, {
    onSuccess: () => {
      toast.success("Category deleted successfully.");
      setIsDeleteDialogOpen(false);
      router.push("/categories");
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError.message);
      }
    },
  });

  function description(): string {
    if (isDisabled) {
      return "You cannot delete a Category while a Player has it.";
    }

    return "Permanently remove this Category. This cannot be undone.";
  }

  return (
    <Card className="ring-destructive/30">
      <CardHeader className="border-destructive/20 bg-destructive/5">
        <CardTitle>Delete category</CardTitle>
        <CardDescription>{description()}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground text-xs font-medium">Name</dt>
            <dd className="min-w-0 text-right text-sm font-medium">
              {categoryName}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground text-xs font-medium">Id</dt>
            <dd className="font-mono text-muted-foreground text-xs break-all">
              {categoryId}
            </dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="border-destructive/20 bg-destructive/5">
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            if (!isExecuting) {
              setIsDeleteDialogOpen(open);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              disabled={isDisabled || isExecuting}
            >
              <TrashIcon />
              Delete category
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete category</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. The Category {categoryName} will be
                permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isExecuting}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={isExecuting}
                onClick={() => executeAsync({ id: categoryId })}
              >
                {isExecuting ? (
                  "Deleting..."
                ) : (
                  <>
                    <TrashIcon />
                    Confirm deletion
                  </>
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
