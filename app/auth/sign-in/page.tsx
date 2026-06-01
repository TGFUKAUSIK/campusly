import Link from "next/link";
import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <main className="safe-top mx-auto min-h-screen w-full max-w-md px-5 pb-8">
      <Link className="text-xs font-extrabold text-[var(--brand)]" href="/">← Back to Campusly</Link>
      <section className="glass-card mt-20 rounded-[30px] p-5">
        <span className="section-kicker">VTOP secure session</span>
        <h1 className="mt-3 text-[32px] font-extrabold leading-tight tracking-[-0.09em]">Welcome back.</h1>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-[var(--muted)]">Connect your student portal to refresh attendance, timetable, grades, and campus services.</p>
        <SignInForm />
      </section>
    </main>
  );
}
