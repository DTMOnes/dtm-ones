"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";

import { createContactRequestAction } from "@/actions/contact-requests";
import { ArrowRightIcon } from "@/components/icons";
import {
  createContactRequestSchema,
  type CreateContactRequest,
} from "@/lib/validation/contact-requests";

import styles from "./styles.module.scss";

export default function ContactForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateContactRequest>({
    resolver: zodResolver(createContactRequestSchema),
    defaultValues: {
      email: "",
      phone: "",
      message: "",
    },
  });

  const { executeAsync, isExecuting } = useAction(createContactRequestAction, {
    onSuccess: () => {
      setSent(true);
      reset();
    },
    onError: ({ error }) => {
      if (error.serverError) {
        setSubmitError(error.serverError.message);
      }
    },
  });

  if (sent) {
    return (
      <div role="status" className={styles.sent}>
        <p className={styles.sentTitle}>Message sent</p>
        <p className={styles.sentCopy}>
          Thanks for reaching out. We&apos;ll get back to you soon.
        </p>
        <button type="button" className={styles.again} onClick={() => setSent(false)}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((values) => {
        setSubmitError(null);
        return executeAsync(values);
      })}
      noValidate
    >
      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Inquiry type</legend>
        <div className={styles.segments}>
          <label className={styles.segment}>
            <input
              type="radio"
              value="seeking_representation"
              disabled={isExecuting}
              {...register("reason")}
            />
            <span>Seeking representation</span>
          </label>
          <label className={styles.segment}>
            <input
              type="radio"
              value="looking_for_a_player"
              disabled={isExecuting}
              {...register("reason")}
            />
            <span>Looking for a player</span>
          </label>
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
          <input
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            disabled={isExecuting}
            {...register("email")}
            className={styles.input}
          />
          {errors.email?.message ? (
            <p className={styles.error} role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Phone</span>
          <input
            type="tel"
            placeholder="+1 555 000 0000"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            disabled={isExecuting}
            {...register("phone")}
            className={styles.input}
          />
          {errors.phone?.message ? (
            <p className={styles.error} role="alert">
              {errors.phone.message}
            </p>
          ) : null}
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Message</span>
        <textarea
          placeholder="Tell us what you need"
          rows={6}
          aria-invalid={!!errors.message}
          disabled={isExecuting}
          {...register("message")}
          className={`${styles.input} ${styles.textarea}`}
        />
        {errors.message?.message ? (
          <p className={styles.error} role="alert">
            {errors.message.message}
          </p>
        ) : null}
      </label>

      <button type="submit" disabled={isExecuting} className={`btn btn-red ${styles.submit}`}>
        {isExecuting ? "Sending…" : "Send message"}
        <ArrowRightIcon size={18} />
      </button>

      {submitError ? (
        <p className={styles.error} role="alert">
          {submitError}
        </p>
      ) : null}
    </form>
  );
}
