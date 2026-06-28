"use client";

// React
import { useState } from "react";

// Next
import { useRouter } from "next/navigation";

// Shadcn
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
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";
import { useDeleteCategoryMutation } from "@/hooks/api/use-categories";

type DeleteCategoryCardProps = {
  categoryId: string;
  categoryName: string;
  playerCount: number;
};

export default function DeleteCategoryCard({
  categoryId,
  categoryName,
  playerCount,
}: DeleteCategoryCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: confirmDelete, isPending } = useDeleteCategoryMutation();

  return (
    <Card className="border-destructive ring-destructive/30">
      <CardHeader className="border-b border-destructive/20">
        <CardTitle>Delete category</CardTitle>
        <CardDescription>
          Delete the category from the system. Players are not deleted; they are
          only removed from this category.
        </CardDescription>
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
            if (!isPending) {
              setIsDeleteDialogOpen(open);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={isPending}>
              Delete category
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete category</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The category &quot;
                {categoryName}&quot; will be deleted and unassigned{" "}
                {playerCount} player{playerCount === 1 ? "" : "s"}.{playerCount}{" "}
                player{playerCount === 1 ? "" : "s"}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() =>
                  confirmDelete(categoryId, {
                    onSuccess: (response) => {
                      toast.success(response.message);
                      setIsDeleteDialogOpen(false);
                      router.push("/categories");
                    },
                    onError: (error) => {
                      toast.error("No se pudo eliminar la categoría.", {
                        description:
                          error instanceof ApiError ? error.message : undefined,
                      });
                    },
                  })
                }
              >
                {isPending ? "Deleting..." : "Confirm deletion"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
