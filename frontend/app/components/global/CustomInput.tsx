import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface CustomInputProps<T extends FieldValues> extends Omit<
  ComponentProps<typeof Input>,
  "name"
> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  startIcon?: ReactNode;
}

export function CustomInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  startIcon,
  className,
  ...props
}: CustomInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === "password";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="space-y-1.5">
          <FieldLabel
            htmlFor={name}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1"
          >
            {label}
          </FieldLabel>

          <div className="relative group">
            {startIcon && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors pointer-events-none z-10">
                {startIcon}
              </div>
            )}

            <Input
              id={name}
              disabled={disabled}
              {...field}
              {...props}
              type={isPassword && showPassword ? "text" : props.type}
              className={cn(
                // Base Layout
                "w-full rounded-2xl py-6", // py-6 handles height better for this design
                startIcon ? "pl-12" : "pl-4",
                isPassword ? "pr-12" : "pr-4",
                "text-sm transition-all outline-none shadow-sm",

                // // Light Mode Styles
                // "bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400",
                // "focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary",

                // // Dark Mode Styles
                // "dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600",
                // "dark:focus:bg-slate-950 dark:focus:ring-primary/20 dark:focus:border-primary",

                // // Disabled State
                // "disabled:opacity-50 dark:disabled:opacity-50",

                // Error State
                fieldState.invalid &&
                  "border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-900 dark:focus:ring-red-900/30",

                className,
              )}
            />
            {isPassword && (
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-slate-500 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>

          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
