"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";
import { useAction } from "next-safe-action/hooks";

import { createContactRequestAction } from "@/actions/contact-requests";
import {
  createContactRequestSchema,
  type CreateContactRequest,
} from "@/lib/validation/contact-requests";

import styles from "./styles.module.scss";

const easeOut = [0.16, 1, 0.3, 1] as const;

const REASON_OPTIONS = [
  { value: "seeking_representation", label: "Seeking representation" },
  { value: "looking_for_a_player", label: "Looking for a player" },
] as const;

export default function ContactForm() {
  const reduce = useReducedMotion() ?? false;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const reasonRefs = useRef<Array<HTMLLabelElement | null>>([]);
  const [thumb, setThumb] = useState({ x: 0, width: 0 });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateContactRequest>({
    resolver: zodResolver(createContactRequestSchema),
    defaultValues: {
      email: "",
      phone: "",
      message: "",
    },
  });

  const reason = watch("reason");

  useLayoutEffect(() => {
    const sync = () => {
      const index = REASON_OPTIONS.findIndex((option) => option.value === reason);
      if (index < 0) {
        setThumb({ x: 0, width: 0 });
        return;
      }

      const el = reasonRefs.current[index];
      if (!el) return;
      setThumb({ x: el.offsetLeft, width: el.offsetWidth });
    };

    sync();
    const fonts = document.fonts?.ready.then(sync).catch(() => undefined);
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      void fonts;
    };
  }, [reason]);

  const { executeAsync, isExecuting } = useAction(createContactRequestAction, {
    onSuccess: ({ data }) => {
      setSubmitMessage(data?.message ?? "Your message was sent successfully.");
      reset();
    },
    onError: ({ error }) => {
      if (error.serverError) {
        setSubmitError(error.serverError.message);
      }
    },
  });

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((values) => {
        setSubmitError(null);
        setSubmitMessage(null);
        return executeAsync(values);
      })}
      noValidate
    >
      <fieldset className={styles.fieldset}>
        <legend className={styles.reasonLegend}>Inquiry type</legend>
        <div className={styles.reasonTrack} role="presentation">
          <motion.span
            className={styles.reasonIndicator}
            aria-hidden
            initial={false}
            animate={{ x: thumb.x, width: thumb.width }}
            transition={
              reduce || thumb.width === 0
                ? { duration: 0 }
                : { type: "tween", duration: 0.28, ease: easeOut }
            }
          />
          {REASON_OPTIONS.map((option, index) => (
            <label
              key={option.value}
              ref={(el) => {
                reasonRefs.current[index] = el;
              }}
              className={styles.reasonOption}
              htmlFor={`contact-reason-${option.value}`}
            >
              <input
                id={`contact-reason-${option.value}`}
                type="radio"
                value={option.value}
                disabled={isExecuting}
                {...register("reason")}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {errors.reason?.message ? (
          <p className={styles.error} role="alert">
            {errors.reason.message}
          </p>
        ) : null}
      </fieldset>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <div className={styles.inputShell}>
            <input
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={isExecuting}
              {...register("email")}
              className={styles.input}
            />
          </div>
          {errors.email?.message ? (
            <p className={styles.error} role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Phone</span>
          <div className={styles.inputShell}>
            <input
              type="tel"
              placeholder="+1 555 000 0000"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              disabled={isExecuting}
              {...register("phone")}
              className={styles.input}
            />
          </div>
          {errors.phone?.message ? (
            <p className={styles.error} role="alert">
              {errors.phone.message}
            </p>
          ) : null}
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Message</span>
        <div className={styles.textareaShell}>
          <textarea
            placeholder="Tell us what you need"
            rows={5}
            aria-invalid={!!errors.message}
            disabled={isExecuting}
            {...register("message")}
            className={styles.textarea}
          />
        </div>
        {errors.message?.message ? (
          <p className={styles.error} role="alert">
            {errors.message.message}
          </p>
        ) : null}
      </label>

      <div className={styles.actions}>
        <button type="submit" disabled={isExecuting} className={styles.button}>
          {isExecuting ? "Sending…" : "Send message"}
        </button>

        {submitError ? (
          <p className={styles.error} role="alert">
            {submitError}
          </p>
        ) : null}
        {submitMessage ? (
          <p className={styles.success} role="status">
            {submitMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}
