/*
"use client";

// Next
import Image from "next/image";

// Hooks
import { useState, useCallback } from "react";

// Uploadthing
import { useDropzone } from "@uploadthing/react";
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from "uploadthing/client";
import { useUploadThing } from "@/utils/uploadthing";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { deleteUploadThingFile } from "@/actions/uploadthing";

// Shadcn
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Phosphor
import { InfoIcon, TrashIcon } from "@phosphor-icons/react";

export default function SingleImageField({
  label,
}: {
  label: string;
  imageUrl?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | null>(imageUrl || null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFile(acceptedFiles[0]);
    },
    [imageUrl],
  );

  const { startUpload, routeConfig, isUploading } = useUploadThing(
    "singleImageUploader",
    {
      onClientUploadComplete: (res) => {
        toast.success("Imagen subida correctamente.");
        setImage(res[0].ufsUrl);
      },
      onUploadError: () => {
        toast.error("Error al subir la imagen.");
      },
      onUploadBegin: () => {
        toast.info(`Subiendo imagen...`);
      },
    },
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes,
    ),
  });

  const { execute, isExecuting } = useAction(deleteUploadThingFile, {
    onSuccess: (res) => {
      console.log(res);
      toast.success("Imagen eliminada correctamente");
      setImage(null);
    },
    onError: ({ error }) => {
      toast.error("Error al eliminar la imagen", {
        description: error.serverError,
      });
    },
  });

  return (
    <Field>
      <FieldLabel>Imagen de la categoría</FieldLabel>
      {image ? (
        <FieldContent>
          <div className="w-full h-48 relative flex justify-center items-center bg-gray-200 rounded-md overflow-hidden">
            <Image
              src={image}
              alt="Imagen de la categoría"
              width={1024}
              height={1024}
              className="object-cover w-full h-full"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => execute({ imageUrl: image })}
            >
              {isExecuting ? <Spinner /> : <TrashIcon className="size-4" />}
            </Button>
          </div>
        </FieldContent>
      ) : (
        <>
          <FieldContent
            {...getRootProps()}
            className="w-full py-16 flex flex-col justify-center items-center gap-4 border border-gray-200 rounded-md cursor-pointer"
          >
            <input {...getInputProps()} />
            <div>
              {file && (
                <button
                  onClick={() => startUpload([file])}
                  disabled={isUploading}
                >
                  Upload {file.name}
                </button>
              )}
            </div>
            <p className="p-4 border border-gray-200 rounded-md">
              Añadir imagen
            </p>
            <p className="text-sm text-muted-foreground">
              O haz click para seleccionar
            </p>
          </FieldContent>
        </>
      )}

      <FieldDescription className="flex items-center gap-1 text-sm text-muted-foreground">
        <InfoIcon className="size-4" />
        <span>Máximo 4MB</span>
      </FieldDescription>
      <FieldError>{/*{error && <p>{error.message}</p>}</FieldError>
    </Field>
  );
}
*/
