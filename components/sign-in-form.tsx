"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LockKeyhole, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { signInToVtop } from "@/lib/api/vtop-auth";

const signInSchema = z.object({
  username: z.string().trim().min(3, "Enter your VTOP username."),
  password: z.string().min(1, "Enter your VTOP password."),
  captcha: z.string().trim().min(4, "Type the CAPTCHA shown above.")
});

type SignInFields = z.infer<typeof signInSchema>;

export function SignInForm() {
  const queryClient = useQueryClient();
  const [captchaVersion, setCaptchaVersion] = useState(1);
  const [message, setMessage] = useState<string>();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    resetField
  } = useForm<SignInFields>({ resolver: zodResolver(signInSchema) });

  function refreshCaptcha() {
    setCaptchaVersion((version) => version + 1);
    resetField("captcha");
  }

  async function onSubmit(values: SignInFields) {
    setMessage(undefined);

    try {
      await signInToVtop(values);
      if (typeof window !== "undefined") {
        Object.keys(window.localStorage)
          .filter((key) => key.startsWith("campusly:"))
          .forEach((key) => window.localStorage.removeItem(key));
      }
      await queryClient.invalidateQueries();
      setMessage("Signed in securely. Loading your campus data...");
      window.setTimeout(() => window.location.assign("/"), 700);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in failed. Refresh the CAPTCHA and try again.");
      refreshCaptcha();
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <label className="block">
        <span className="section-kicker">VTOP username</span>
        <span className="mt-2 flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white/70 px-3 dark:bg-white/5">
          <UserRound className="text-[var(--muted)]" size={16} />
          <input autoComplete="username" className="min-h-12 w-full bg-transparent text-sm outline-none" placeholder="Registration number" {...register("username")} />
        </span>
        {errors.username ? <span className="mt-1 block text-[11px] font-bold text-[var(--warm)]">{errors.username.message}</span> : null}
      </label>
      <label className="block">
        <span className="section-kicker">VTOP password</span>
        <span className="mt-2 flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white/70 px-3 dark:bg-white/5">
          <LockKeyhole className="text-[var(--muted)]" size={16} />
          <input autoComplete="current-password" className="min-h-12 w-full bg-transparent text-sm outline-none" placeholder="Your password" type="password" {...register("password")} />
        </span>
        {errors.password ? <span className="mt-1 block text-[11px] font-bold text-[var(--warm)]">{errors.password.message}</span> : null}
      </label>
      <label className="block">
        <span className="section-kicker">Security check</span>
        <span className="mt-2 flex items-center gap-2">
          <span className="flex min-h-[74px] flex-1 items-center overflow-hidden rounded-2xl border border-[var(--line)] bg-[#eef5f1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="CAPTCHA challenge" className="h-[74px] w-full object-cover" src={`/api/vtop/captcha?v=${captchaVersion}`} />
          </span>
          <button
            aria-label="Refresh CAPTCHA"
            className="grid h-[74px] w-14 shrink-0 place-items-center rounded-2xl border border-[var(--line)] bg-white/70 text-[var(--brand)] dark:bg-white/5"
            onClick={refreshCaptcha}
            type="button"
          >
            <RefreshCw size={18} />
          </button>
        </span>
        <span className="mt-2 flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white/70 px-3 dark:bg-white/5">
          <ShieldCheck className="text-[var(--muted)]" size={16} />
          <input autoComplete="off" className="min-h-12 w-full bg-transparent text-sm uppercase outline-none" placeholder="Type the CAPTCHA" {...register("captcha")} />
        </span>
        {errors.captcha ? <span className="mt-1 block text-[11px] font-bold text-[var(--warm)]">{errors.captcha.message}</span> : null}
      </label>
      {message ? <p className="text-xs font-bold leading-relaxed text-[var(--brand)]">{message}</p> : null}
      <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] text-sm font-extrabold text-white shadow-float disabled:opacity-60" disabled={isSubmitting}>
        {isSubmitting ? "Starting secure session..." : "Sign in to VTOP"}
        <ArrowRight size={16} />
      </button>
      <p className="text-[10px] font-semibold leading-relaxed text-[var(--muted)]">
        Your password is submitted only to the private session bridge and is never stored in the browser.
      </p>
    </form>
  );
}
