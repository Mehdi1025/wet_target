import type { ContactRow } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type JournalBlockProps = {
  messages: ContactRow[];
};

function contactStatusLabel(status: ContactRow["status"]) {
  const map = {
    new: "Nouveau",
    read: "Lu",
    replied: "Répondu",
    archived: "Archivé",
  };
  return map[status];
}

function contactStatusVariant(
  status: ContactRow["status"]
): "success" | "processing" | "secondary" | "outline" {
  const map = {
    new: "processing" as const,
    read: "secondary" as const,
    replied: "success" as const,
    archived: "outline" as const,
  };
  return map[status];
}

function messageSubject(message: ContactRow) {
  if (message.source_page?.trim()) {
    return message.source_page;
  }
  if (message.company?.trim()) {
    return `Contact — ${message.company}`;
  }
  return "Message formulaire site";
}

export function JournalBlock({ messages }: JournalBlockProps) {
  return (
    <Card className="shadow-sm md:col-span-2">
      <CardHeader>
        <CardTitle>Journal & Messages</CardTitle>
        <CardDescription>
          Fil d&apos;actualité Supabase — messages liés au client
        </CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm font-medium">Aucun message pour ce client</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Les soumissions du formulaire site apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="relative space-y-0">
            <div className="absolute bottom-2 left-[11px] top-2 w-px bg-border" />
            {messages.map((message) => (
              <article key={message.id} className="relative pl-8 pb-6 last:pb-0">
                <div className="absolute left-0 top-1.5 h-[22px] w-[22px] rounded-full border-2 border-background bg-primary/80 shadow-sm" />
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <time
                      dateTime={message.created_at}
                      className="text-xs text-muted-foreground"
                    >
                      {new Date(message.created_at).toLocaleString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    <Badge variant={contactStatusVariant(message.status)}>
                      {contactStatusLabel(message.status)}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{messageSubject(message)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {message.full_name} · {message.email}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {message.message}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
