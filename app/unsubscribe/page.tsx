"use client";

import { use, useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = use(searchParams);
  const unsubscribe = useMutation(api.newsletter.unsubscribeByToken);
  const [status, setStatus] = useState<"loading" | "success" | "notfound" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("notfound");
      return;
    }
    unsubscribe({ token })
      .then((res) => setStatus(res?.found ? "success" : "notfound"))
      .catch(() => setStatus("error"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        {status === "loading" && (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
            <h1 className="text-xl font-bold">Désabonné</h1>
            <p className="text-muted-foreground text-sm">
              Tu ne recevras plus d&apos;emails de keil-enzo.dev.
            </p>
          </>
        )}

        {status === "notfound" && (
          <>
            <XCircle className="h-10 w-10 text-muted-foreground mx-auto" />
            <h1 className="text-xl font-bold">Lien invalide</h1>
            <p className="text-muted-foreground text-sm">
              Ce lien de désabonnement est introuvable ou déjà utilisé.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 text-destructive mx-auto" />
            <h1 className="text-xl font-bold">Erreur</h1>
            <p className="text-muted-foreground text-sm">
              Une erreur s&apos;est produite. Réessaie plus tard.
            </p>
          </>
        )}

        {status !== "loading" && (
          <Link href="/">
            <Button variant="outline" size="sm" className="mt-2">
              Retour à l&apos;accueil
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
