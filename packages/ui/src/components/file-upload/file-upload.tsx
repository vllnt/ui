"use client";

import * as React from "react";

import { FileUp, UploadCloud, X } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";

export type FileUploadProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "onChange" | "type" | "value"
> & {
  browseLabel?: string;
  dropzoneText?: string;
  files?: File[];
  helperText?: string;
  onFilesChange?: (files: File[]) => void;
};

function useFileUploadState(
  controlledFiles: File[] | undefined,
  multiple: boolean,
  onFilesChange?: (files: File[]) => void,
) {
  const [internalFiles, setInternalFiles] = React.useState<File[]>(
    controlledFiles ?? [],
  );

  React.useEffect(() => {
    if (controlledFiles !== undefined) {
      setInternalFiles(controlledFiles);
    }
  }, [controlledFiles]);

  const resolvedFiles = controlledFiles ?? internalFiles;

  const updateFiles = React.useCallback(
    (nextFiles: File[]) => {
      if (controlledFiles === undefined) {
        setInternalFiles(nextFiles);
      }

      onFilesChange?.(nextFiles);
    },
    [controlledFiles, onFilesChange],
  );

  const addFiles = React.useCallback(
    (incomingFiles: File[] | FileList) => {
      const nextFiles = [...incomingFiles];
      updateFiles(
        multiple ? [...resolvedFiles, ...nextFiles] : nextFiles.slice(0, 1),
      );
    },
    [multiple, resolvedFiles, updateFiles],
  );

  const removeFile = React.useCallback(
    (fileToRemove: File) => {
      updateFiles(
        resolvedFiles.filter(
          (file) =>
            !(
              file.name === fileToRemove.name &&
              file.size === fileToRemove.size &&
              file.lastModified === fileToRemove.lastModified
            ),
        ),
      );
    },
    [resolvedFiles, updateFiles],
  );

  return { addFiles, removeFile, resolvedFiles };
}

function assignInputReference(
  reference: React.ForwardedRef<HTMLInputElement>,
  node: HTMLInputElement | null,
) {
  if (typeof reference === "function") {
    reference(node);
    return;
  }

  if (reference) {
    reference.current = node;
  }
}

function FileListItem({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {(file.size / 1024).toFixed(1)} KB
        </p>
      </div>
      <Button
        aria-label={`Remove ${file.name}`}
        onClick={onRemove}
        size="icon"
        type="button"
        variant="ghost"
      >
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
}

type FileUploadDropzoneProps = {
  browseLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
  dropzoneText: string;
  helperText: string;
  isDragging: boolean;
  onActivate: () => void;
  onDragStateChange: (dragging: boolean) => void;
  onFilesDrop: (files: FileList) => void;
};

function FileUploadDropzone({
  browseLabel,
  children,
  disabled,
  dropzoneText,
  helperText,
  isDragging,
  onActivate,
  onDragStateChange,
  onFilesDrop,
}: FileUploadDropzoneProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-input bg-background px-6 py-8 text-center transition-colors",
        isDragging && "border-primary bg-accent/40",
        disabled && "cursor-not-allowed opacity-50",
      )}
      onClick={onActivate}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) {
          onDragStateChange(true);
        }
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        onDragStateChange(false);
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDragStateChange(false);
        if (!disabled && event.dataTransfer.files.length > 0) {
          onFilesDrop(event.dataTransfer.files);
        }
      }}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && !disabled) {
          event.preventDefault();
          onActivate();
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground" />
      <div className="space-y-1">
        <p className="font-medium">{dropzoneText}</p>
        <p className="text-sm text-muted-foreground">{helperText}</p>
      </div>
      <span className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-input bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm">
        <FileUp className="mr-2 h-4 w-4" />
        {browseLabel}
      </span>
      {children}
    </div>
  );
}

function FileUploadList({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (file: File) => void;
}) {
  if (files.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <FileListItem
          file={file}
          key={`${file.name}-${file.lastModified}-${file.size}`}
          onRemove={() => {
            onRemove(file);
          }}
        />
      ))}
    </ul>
  );
}

function FileUploadComponent(
  {
    accept,
    browseLabel = "Choose files",
    className,
    disabled,
    dropzoneText = "Drag and drop files here, or click to browse.",
    files,
    helperText = "Supports one or more files.",
    multiple = true,
    onFilesChange,
    ...props
  }: FileUploadProps,
  reference: React.ForwardedRef<HTMLInputElement>,
) {
  const inputReference = React.useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const { addFiles, removeFile, resolvedFiles } = useFileUploadState(
    files,
    multiple,
    onFilesChange,
  );

  return (
    <div className={cn("space-y-3", className)}>
      <FileUploadDropzone
        browseLabel={browseLabel}
        disabled={disabled}
        dropzoneText={dropzoneText}
        helperText={helperText}
        isDragging={isDragging}
        onActivate={() => {
          if (!disabled) {
            inputReference.current?.click();
          }
        }}
        onDragStateChange={setIsDragging}
        onFilesDrop={addFiles}
      >
        <input
          {...props}
          accept={accept}
          aria-label={browseLabel}
          className="sr-only"
          disabled={disabled}
          multiple={multiple}
          onChange={(event) => {
            if (event.target.files) {
              addFiles(event.target.files);
            }
          }}
          ref={(node) => {
            inputReference.current = node;
            assignInputReference(reference, node);
          }}
          type="file"
        />
      </FileUploadDropzone>
      <FileUploadList files={resolvedFiles} onRemove={removeFile} />
    </div>
  );
}

const FileUpload = React.forwardRef(FileUploadComponent);
FileUpload.displayName = "FileUpload";

export { FileUpload };
