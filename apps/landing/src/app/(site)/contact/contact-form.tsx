"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createContactRequest } from "@/actions/contact-requests";
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
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateContactRequest>({
    resolver: zodResolver(createContactRequestSchema as never),
    defaultValues: {
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (data: CreateContactRequest) => {
    setSubmitError(null);
    setSubmitMessage(null);

    const { data: result, error } = await createContactRequest(data);

    if (error) {
      if (error.fieldErrors) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          const message = messages?.[0];
          if (
            message &&
            (field === "type" ||
              field === "email" ||
              field === "phone" ||
              field === "message")
          ) {
            setError(field, { message });
          }
        }
      }
      setSubmitError(error.message);
      return;
    }

    setSubmitMessage(result.message ?? "Your message was sent successfully.");
    reset();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <fieldset className={styles.fieldset}>
        <legend className={styles.visuallyHidden}>I am a</legend>
        <div className={styles.options}>
          <label className={styles.option} htmlFor="contact-type-player">
            <input
              id="contact-type-player"
              type="radio"
              value="player"
              disabled={isSubmitting}
              {...register("type")}
            />
            <span>Seeking representation</span>
          </label>
          <label className={styles.option} htmlFor="contact-type-recruiter">
            <input
              id="contact-type-recruiter"
              type="radio"
              value="recruiter"
              disabled={isSubmitting}
              {...register("type")}
            />
            <span>Hire services</span>
          </label>
        </div>
        {errors.type?.message ? (
          <p className={styles.error} role="alert">
            {errors.type.message}
          </p>
        ) : null}
      </fieldset>

      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          type="email"
          placeholder="you@email.com"
          aria-invalid={!!errors.email}
          disabled={isSubmitting}
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
          placeholder="Your phone number"
          aria-invalid={!!errors.phone}
          disabled={isSubmitting}
          {...register("phone")}
          className={styles.input}
        />
        {errors.phone?.message ? (
          <p className={styles.error} role="alert">
            {errors.phone.message}
          </p>
        ) : null}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Message</span>
        <textarea
          placeholder="How can we help you?"
          rows={5}
          aria-invalid={!!errors.message}
          disabled={isSubmitting}
          {...register("message")}
          className={styles.textarea}
        />
        {errors.message?.message ? (
          <p className={styles.error} role="alert">
            {errors.message.message}
          </p>
        ) : null}
      </label>

      <button type="submit" disabled={isSubmitting} className={styles.button}>
        {isSubmitting ? "Sending…" : "Send message"}
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
    </form>
  );
}
