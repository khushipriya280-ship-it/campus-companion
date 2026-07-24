import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft" | "lovable", opts?: SignInOptions) => {
      const isLovableHost =
        typeof window !== "undefined" &&
        (window.location.hostname.endsWith(".lovable.app") ||
          window.location.hostname.endsWith(".lovableproject.com"));

      if (isLovableHost) {
        try {
          const lovableAuth = createLovableAuth();
          const result = await lovableAuth.signInWithOAuth(provider, {
            redirect_uri: opts?.redirect_uri,
            extraParams: {
              ...opts?.extraParams,
            },
          });

          if (result.redirected) {
            return result;
          }

          if (result.error) {
            return result;
          }

          if (result.tokens) {
            try {
              await supabase.auth.setSession(result.tokens);
            } catch (e) {
              return { error: e instanceof Error ? e : new Error(String(e)) };
            }
          }

          return result;
        } catch (e) {
          console.warn("Lovable cloud auth failed, falling back to direct Supabase OAuth:", e);
        }
      }

      // Direct Supabase OAuth for standard deployments (e.g. Vercel, custom domain, local dev)
      const supabaseProvider = provider === "microsoft" ? "azure" : (provider as "google" | "apple" | "azure");
      const redirectUrl = opts?.redirect_uri || (typeof window !== "undefined" ? window.location.origin : "");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: supabaseProvider,
        options: {
          redirectTo: redirectUrl,
          queryParams: opts?.extraParams,
        },
      });

      if (error) {
        return { error, redirected: false, tokens: null };
      }

      if (data?.url && typeof window !== "undefined") {
        window.location.href = data.url;
      }

      return { error: null, redirected: true, tokens: null };
    },
  },
};
