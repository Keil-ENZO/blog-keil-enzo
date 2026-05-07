"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

export function UserSync() {
  const { isSignedIn } = useAuth();
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (isSignedIn) {
      void upsertUser({});
    }
  }, [isSignedIn, upsertUser]);

  return null;
}
