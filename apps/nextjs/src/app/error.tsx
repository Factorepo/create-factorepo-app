"use client";

import {
  PAGE_ERROR_DESCRIPTION,
  PAGE_ERROR_RETRY,
  PAGE_ERROR_TITLE,
} from "@acme/constants";
import { Button } from "@acme/ui/button";

export default function HomeError(props: { error: Error; reset: () => void }) {
  return (
    <main className="container flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">{PAGE_ERROR_TITLE}</h1>
      <p className="text-muted-foreground">{PAGE_ERROR_DESCRIPTION}</p>
      <Button onClick={props.reset}>{PAGE_ERROR_RETRY}</Button>
    </main>
  );
}
