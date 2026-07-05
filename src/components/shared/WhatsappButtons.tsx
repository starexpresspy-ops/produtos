import { WhatsappButton } from "@/components/shared/WhatsappButton";
import type { WhatsappContact } from "@/lib/whatsapp";
import { cn } from "@/lib/utils/cn";

interface WhatsappButtonsProps {
  contacts: WhatsappContact[];
  message: string;
  size?: "md" | "lg";
  variant?: "solid" | "outline";
  fullWidth?: boolean;
  layout?: "row" | "column";
  className?: string;
}

export function WhatsappButtons({
  contacts,
  message,
  size = "md",
  variant = "solid",
  fullWidth = false,
  layout = "column",
  className,
}: WhatsappButtonsProps) {
  if (contacts.length === 0) return null;

  if (contacts.length === 1) {
    return (
      <WhatsappButton
        phone={contacts[0].phone}
        message={message}
        label={contacts[0].label}
        size={size}
        variant={variant}
        fullWidth={fullWidth}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex gap-2",
        layout === "column" ? "flex-col" : "flex-row flex-wrap",
        fullWidth && "w-full",
        className,
      )}
    >
      {contacts.map((contact) => (
        <WhatsappButton
          key={contact.phone}
          phone={contact.phone}
          message={message}
          label={contact.label}
          size={size}
          variant={variant}
          fullWidth={fullWidth || layout === "column"}
        />
      ))}
    </div>
  );
}
