"use client";

// React
import { useState, useEffect } from "react";

// Motion
import { motion, useSpring } from "motion/react";

// Styles
import styles from "./styles.module.scss";

const steps = [0, 25, 50, 75, 100];
const STEP_EM = 1;

export default function Loader() {
  const [currentStep, setCurrentStep] = useState(0);

  const y = useSpring("100%", {
    stiffness: 100,
    damping: 10,
  });

  const y2 = useSpring("0em", {
    stiffness: 100,
    damping: 10,
  });

  useEffect(() => {
    y.set(`${100 - steps[currentStep]}%`);
    y2.set(`${-currentStep * STEP_EM}em`);
  }, [currentStep, y, y2]);

  useEffect(() => {
    if (currentStep >= steps.length - 1) return;

    const next = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(next);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(next);
  }, [currentStep]);

  return (
    <motion.div
      initial={{ y: "0" }}
      exit={{
        y: "-100vh",
        transition: {
          duration: 0.8,
          ease: [0.76, 0, 0.24, 1],
          delay: 0.2,
        },
      }}
      className={styles.container}
    >
      <div className={styles.content}>
        <div className={styles.mask}>
          <motion.div className={styles.block} style={{ y }}></motion.div>
        </div>

        <div
          className={styles.progress}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className={styles.loading}>Loading...</span>

          <div
            className={styles.percentage}
            aria-label={`Loading ${steps[currentStep]}%`}
          >
            <div className={styles.wrapper}>
              <motion.div className={styles.slider} style={{ y: y2 }}>
                {steps.map((step) => (
                  <span key={step} className={styles.number}>
                    {step}
                  </span>
                ))}
              </motion.div>
            </div>

            <span className={styles.symbol}>%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
