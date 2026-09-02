import { Pressable, Text } from "react-native";

import { AUTH_SIGN_IN, AUTH_SIGN_OUT, authSignedInAs } from "@acme/constants";

import { authClient } from "~/utils/auth";

const SIGNED_OUT = "Not logged in";

export function MobileAuth() {
  const { data: session } = authClient.useSession();

  return (
    <>
      <Text className="text-foreground pb-2 text-center text-xl font-semibold">
        {session?.user.name ? authSignedInAs(session.user.name) : SIGNED_OUT}
      </Text>
      <Pressable
        onPress={() =>
          session
            ? authClient.signOut()
            : authClient.signIn.social({
                provider: "discord",
                callbackURL: "/",
              })
        }
        className="bg-primary flex items-center rounded-sm p-2"
      >
        <Text>{session ? AUTH_SIGN_OUT : AUTH_SIGN_IN}</Text>
      </Pressable>
    </>
  );
}
