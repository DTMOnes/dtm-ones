"use client";

// React Hook Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { createContactRequest } from "@/actions/contact-requests";

// Validation Schema
import { createContactRequestSchema as schema } from "@/lib/validation/contact-requests";

// Toast
import { toast } from "sonner";

// Zod
import { z } from "zod";

// Styles
import styles from "./contact-form.module.scss";

type FormValues = z.infer<typeof schema>;

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      email: "",
      message: "",
    },
  });

  const { execute, isExecuting } = useAction(createContactRequest, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
        reset();
      }
    },
    onError: ({ error }) => {
      toast.error("No se pudo enviar el mensaje.", {
        description: error.serverError,
      });
    },
  });

  return (
    <div className={styles.formWrap}>
      <form
        className={styles.form}
        onSubmit={handleSubmit((data) => execute(data))}
        noValidate
      >
        <div className={styles.field}>
          <label htmlFor="contact-email" className={styles.fieldLabel}>
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={styles.fieldInput}
            disabled={isExecuting}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            {...register("email")}
          />
          {errors.email?.message ? (
            <p
              id="contact-email-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-message" className={styles.fieldLabel}>
            Message
          </label>
          <textarea
            id="contact-message"
            rows={5}
            placeholder="Write your message…"
            className={styles.fieldTextarea}
            disabled={isExecuting}
            aria-invalid={!!errors.message}
            aria-describedby={
              errors.message ? "contact-message-error" : undefined
            }
            {...register("message")}
          />
          {errors.message?.message ? (
            <p
              id="contact-message-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.message.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          className={styles.submit}
          disabled={isExecuting}
        >
          {isExecuting ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
