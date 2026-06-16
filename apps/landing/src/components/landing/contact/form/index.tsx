"use client";

// React Hook Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Icons
import { CaretDownIcon } from "@phosphor-icons/react";

// Zod
import { z } from "zod";

// Styles
import styles from "./styles.module.scss";

const schema = z.object({
  reason: z.enum(["hire_services", "seek_representation"], {
    message: "Please select an option",
  }),
  email: z.email("Invalid email"),
  message: z.string().min(1, "Message is required").max(5000),
});

type FormValues = z.infer<typeof schema>;

export default function Form() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    console.log(data);
    // execute({ email: data.email, message: data.message, reason: data.reason })
    reset();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.field}>
        <span className={styles.label}>Reason for contact</span>
        <div className={styles.options_container}>
          <label className={styles.option} htmlFor="hire-services">
            <span>Hire services</span>
            <input
              id="hire-services"
              type="radio"
              value="hire_services"
              {...register("reason")}
            />
          </label>
          <label className={styles.option} htmlFor="seek-representation">
            <span>Seek representation</span>
            <input
              id="seek-representation"
              type="radio"
              value="seek_representation"
              {...register("reason")}
            />
          </label>
        </div>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          type="email"
          placeholder="Example@email.com"
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
        <span className={styles.label}>Message</span>
        <textarea
          placeholder="Your message goes here..."
          rows={6}
          aria-invalid={!!errors.message}
          disabled={isSubmitting}
          {...register("message")}
          className={styles.input}
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
    </form>
  );
}
