import { cn } from "@/lib/utils";

export function ContactRequestField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      {children}
    </div>
  );
}
