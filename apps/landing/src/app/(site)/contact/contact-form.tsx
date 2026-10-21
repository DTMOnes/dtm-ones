"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";

import { createContactRequestAction } from "@/actions/contact-requests";
import { ArrowRightIcon } from "@/components/icons";
import {
  createContactRequestSchema,
  type CreateContactRequest,
} from "@/lib/validation/contact-requests";

import {
  CALLING_COUNTRIES,
  DEFAULT_COUNTRY,
  callingCountry,
  countryFromLocale,
  fullPhone,
} from "@/utils/country-calling-code";
import styles from "./styles.module.scss";

const noSubscribe = () => () => {};

export default function ContactForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  // Country of the phone number: the visitor's pick, else their browser language region.
  const [pickedCountry, setPickedCountry] = useState<string | null>(null);
  const localeCountry = useSyncExternalStore(
    noSubscribe,
    () => countryFromLocale(navigator.language),
    () => DEFAULT_COUNTRY,
  );
  const country = callingCountry(pickedCountry ?? localeCountry);
  // Country names come from the runtime's Intl data, which differs between server and
  // browser, so the full list renders in the browser only.
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
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
        return executeAsync({
          ...values,
          phone: fullPhone(country.code, values.phone),
        });
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

        <div className={styles.field}>
          <span className={styles.label} id="contact-phone-label">
            Phone
          </span>
          <div
            className={`${styles.input} ${styles.phone}`}
            data-invalid={!!errors.phone}
            data-disabled={isExecuting}
          >
            {/* Flag and code on show; the native select on top does the picking. */}
            <span className={styles.country}>
              <Image
                src={`/assets/flags/${country.code}.svg`}
                alt=""
                width={24}
                height={16}
                unoptimized
              />
              <span>+{country.dial}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden>
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" />
              </svg>
              <select
                aria-label="Country calling code"
                value={country.code}
                disabled={isExecuting}
                onChange={(event) => setPickedCountry(event.target.value)}
              >
                {mounted ? (
                  CALLING_COUNTRIES.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.name} (+{option.dial})
                    </option>
                  ))
                ) : (
                  <option value={country.code}>+{country.dial}</option>
                )}
              </select>
            </span>
            <input
              type="tel"
              placeholder="555 000 0000"
              autoComplete="tel-national"
              aria-labelledby="contact-phone-label"
              aria-invalid={!!errors.phone}
              disabled={isExecuting}
              {...register("phone")}
            />
          </div>
          {errors.phone?.message ? (
            <p className={styles.error} role="alert">
              {errors.phone.message}
            </p>
          ) : null}
        </div>
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
