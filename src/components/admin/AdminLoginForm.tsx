"use client";

import { useActionState } from "react";
import { signInAdmin } from "@/actions/auth";
import { adminButtonPrimaryLg } from "@/lib/ui/admin-buttons";

type LoginState = { error?: string };

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    async (_prev, formData) => {
      const result = await signInAdmin(formData);
      return result ?? {};
    },
    {},
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {state?.error ? (
        <div className="bg-danger/10 text-danger rounded-lg px-4 py-3 text-sm">
          {state.error}
        </div>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="border-border w-full rounded-xl border px-3 py-2.5 text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Senha</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="border-border w-full rounded-xl border px-3 py-2.5 text-sm"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className={`${adminButtonPrimaryLg} w-full`}
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
