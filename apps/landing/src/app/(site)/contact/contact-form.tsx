"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";

import { createContactRequestAction } from "@/actions/contact-requests";
import {
  createContactRequestSchema,
  type CreateContactRequest,
} from "@/lib/validation/contact-requests";

import styles from "./styles.module.scss";

export default function ContactForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
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
        <legend className={styles.visuallyHidden}>Inquiry type</legend>
        <div className={styles.options}>
          <label className={styles.option} htmlFor="contact-reason-seeking">
            <input
              id="contact-reason-seeking"
              type="radio"
              value="seeking_representation"
              disabled={isExecuting}
              {...register("reason")}
            />
            <span>Seeking representation</span>
          </label>
          <label className={styles.option} htmlFor="contact-reason-looking">
            <input
              id="contact-reason-looking"
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
          rows={5}
          aria-invalid={!!errors.message}
          disabled={isExecuting}
          {...register("message")}
          className={styles.textarea}
        />
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
