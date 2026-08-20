import Link from "next/link";

import {
  PAGE_NOT_FOUND_DESCRIPTION,
  PAGE_NOT_FOUND_HOME,
  PAGE_NOT_FOUND_TITLE,
} from "@acme/constants";
import { Button } from "@acme/ui/button";

export default function NotFound() {
  return (
    <main className="container flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">{PAGE_NOT_FOUND_TITLE}</h1>
      <p className="text-muted-foreground">{PAGE_NOT_FOUND_DESCRIPTION}</p>
      <Button asChild>
        <Link href="/">{PAGE_NOT_FOUND_HOME}</Link>
      </Button>
    </main>
  );
}
