// Dispara um evento de "página vista" uma única vez, na montagem.
"use client";

import { useEffect, useRef } from "react";
import { track, type EventoTipo } from "@/lib/track";

export function TrackView({
  tipo,
  necessidades,
}: {
  tipo: EventoTipo;
  necessidades?: string[];
}) {
  const jaEnviou = useRef(false);

  useEffect(() => {
    // O StrictMode do React monta duas vezes em dev; o guard evita evento dobrado.
    if (jaEnviou.current) return;
    jaEnviou.current = true;
    track(tipo, necessidades ? { necessidades } : {});
  }, [tipo, necessidades]);

  return null;
}
