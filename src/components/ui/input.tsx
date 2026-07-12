import { cn } from "@/lib/utils";

export {
  Select,
  MultiSelect,
  optionsFromRecord,
  optionsWithEmpty,
  type SelectOption,
} from "@/components/ui/select";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring min-h-[100px] resize-y",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

