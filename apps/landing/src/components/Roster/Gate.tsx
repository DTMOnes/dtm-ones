"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";

import { unlockPlayersAction } from "@/actions/players-access";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";

import styles from "./gate.module.scss";

/** "The roster is private" card: the password unlocks the Players page for this visit. */
export default function Gate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { execute, isExecuting } = useAction(unlockPlayersAction, {
    onSuccess: () => router.refresh(),
    onError: ({ error: actionError }) => {
      setError(actionError.serverError?.message ?? "Incorrect password. Try again.");
    },
  });

  return (
    <section className={styles.gate}>
      <div className={styles.card}>
        <p className={`kicker ${styles.kicker}`}>Private access</p>
        <h1 className={styles.title}>
          <span>The roster</span>
          <span className={styles.accent}>is private</span>
        </h1>
        <p className={styles.copy}>Enter the access password to view our clients.</p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            execute({ password });
          }}
        >
          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <span className={styles.inputWrap}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="5" y="11" width="14" height="10" rx="1" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                className={styles.input}
                type="password"
                autoComplete="current-password"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "gate-error" : undefined}
                value={password}
                disabled={isExecuting}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(null);
                }}
              />
            </span>
          </label>
          {error ? (
            <p id="gate-error" role="alert" className={styles.error}>
              {error}
            </p>
          ) : null}
          <button type="submit" className={`btn btn-red ${styles.submit}`} disabled={isExecuting}>
            {isExecuting ? "Checking…" : "Enter"}
            <ArrowRightIcon size={18} />
          </button>
        </form>

        <Link className={styles.back} href="/">
          <ArrowLeftIcon size={16} />
          Back to home
        </Link>
      </div>
    </section>
  );
}
