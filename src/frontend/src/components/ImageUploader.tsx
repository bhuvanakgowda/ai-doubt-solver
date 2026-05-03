import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Send, Trash2, UploadCloud } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface ImageUploaderProps {
  onSubmit: (imageData: string, caption: string) => void;
  isLoading: boolean;
}

const ACCEPTED = ["image/jpeg", "image/png", "application/pdf"];
const MAX_MB = 10;

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageUploader({
  onSubmit,
  isLoading,
}: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((f: File) => {
    setError("");
    if (!ACCEPTED.includes(f.type)) {
      setError("Only JPG, PNG, or PDF files are supported.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) processFile(dropped);
    },
    [processFile],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
    e.target.value = "";
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setCaption("");
    setError("");
  };

  const handleSubmit = () => {
    if (!file) return;
    const dataToSend = preview ?? `[PDF: ${file.name}]`;
    onSubmit(dataToSend, caption);
  };

  return (
    <div className="flex flex-col gap-4">
      {!file ? (
        <button
          type="button"
          tabIndex={0}
          aria-label="Upload image or PDF file"
          data-ocid="image.dropzone"
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer
            transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}
          `}
        >
          <UploadCloud size={32} className="text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Drop your file here
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG, PDF · Max {MAX_MB} MB
            </p>
          </div>
        </button>
      ) : (
        <div className="space-y-3">
          {/* Preview */}
          <div className="relative rounded-xl overflow-hidden border border-border bg-muted/20">
            {preview ? (
              <img
                src={preview}
                alt="Uploaded preview"
                className="w-full max-h-56 object-contain"
              />
            ) : (
              <div className="flex items-center gap-3 p-4">
                <ImageIcon size={24} className="text-muted-foreground" />
                <span className="text-sm text-foreground truncate flex-1">
                  {file.name}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove uploaded file"
              data-ocid="image.remove_button"
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center hover:bg-destructive transition-smooth"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* File meta */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <span className="truncate max-w-[60%]">{file.name}</span>
            <span className="ml-auto shrink-0">{humanSize(file.size)}</span>
          </div>

          {/* Caption */}
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption or question about this image (optional)"
            rows={2}
            aria-label="Caption for image"
            data-ocid="image.caption_input"
            className="resize-none text-sm"
          />
        </div>
      )}

      {error && (
        <p
          className="text-xs text-destructive"
          role="alert"
          data-ocid="image.error_state"
        >
          {error}
        </p>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !file}
        className="w-full gap-2"
        aria-label="Submit image doubt"
        data-ocid="image.submit_button"
      >
        <Send size={15} /> Ask about this image
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={handleFileInput}
      />
    </div>
  );
}
