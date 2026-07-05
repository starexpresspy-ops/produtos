import { MessageCircle } from "lucide-react";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils/cn";

interface WhatsappButtonProps {
  phone: string;
  message: string;
  label: string;
  size?: "md" | "lg";
  fullWidth?: boolean;
  variant?: "solid" | "outline";
}

export function WhatsappButton({
  phone,
  message,
  label,
  size = "md",
  fullWidth = false,
  variant = "solid",
}: WhatsappButtonProps) {
  return (
    <a
      href={buildWhatsappUrl(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 font-semibold transition-colors",
        size === "lg" ? "py-3 text-base" : "py-2.5 text-sm",
        variant === "solid"
          ? "bg-primary hover:bg-primary-hover text-white"
          : "border-border hover:bg-background border text-foreground",
        fullWidth && "w-full",
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}
