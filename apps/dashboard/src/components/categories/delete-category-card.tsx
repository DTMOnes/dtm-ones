"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

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
    <Card className="border-destructive ring-destructive/30">
      <CardHeader className="border-b border-destructive/20">
        <CardTitle>Delete category</CardTitle>
        <CardDescription>{description()}</CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium">{categoryName}</p>
          <p className="text-muted-foreground text-xs">{categoryId}</p>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t border-destructive/20 bg-destructive/5 py-4">
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
                {isExecuting ? "Deleting..." : "Confirm deletion"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
