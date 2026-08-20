import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_SIGN_IN, AUTH_SIGN_OUT, authSignedInAs } from "@acme/constants";
import { Button } from "@acme/ui/button";

import { auth, getSession } from "~/auth/server";

export async function AuthShowcase() {
  const session = await getSession();

  if (!session) {
    return (
      <form>
        <Button
          size="lg"
          formAction={async () => {
            "use server";
            const res = await auth.api.signInSocial({
              body: { provider: "discord" },
            });
            if (!res.url) {
              throw new Error("No URL returned from signInSocial");
            }
            redirect(res.url);
          }}
        >
          {AUTH_SIGN_IN}
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">
        <span>{authSignedInAs(session.user.name)}</span>
      </p>

      <form>
        <Button
          size="lg"
          formAction={async () => {
            "use server";
            await auth.api.signOut({ headers: await headers() });
            redirect("/");
          }}
        >
          {AUTH_SIGN_OUT}
        </Button>
      </form>
    </div>
  );
}
