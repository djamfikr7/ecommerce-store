'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  shortLabel?: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <li key={step.id} className="flex items-center">
              {/* Step Circle */}
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                className={`
                  relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full
                  transition-all duration-300
                  ${isCompleted ? 'bg-accent' : ''}
                  ${isActive ? 'bg-accent shadow-lg shadow-accent/50' : ''}
                  ${isUpcoming ? 'bg-white/5 border-2 border-white/20' : ''}
                `}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                ) : (
                  <span
                    className={`
                      text-sm sm:text-base font-bold
                      ${isActive ? 'text-white' : ''}
                      ${isUpcoming ? 'text-white/40' : ''}
                    `}
                  >
                    {step.id}
                  </span>
                )}

                {/* Active Glow */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 rounded-full bg-accent/50 -z-10 blur-md"
                  />
                )}
              </motion.div>

              {/* Step Label */}
              <div className="hidden sm:block ml-3">
                <span
                  className={`
                    text-sm font-medium transition-colors
                    ${isActive ? 'text-white' : ''}
                    ${isCompleted ? 'text-accent' : ''}
                    ${isUpcoming ? 'text-white/40' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="relative mx-2 sm:mx-4 h-0.5 w-8 sm:w-16">
                  {/* Background Line */}
                  <div className="absolute inset-0 bg-white/20 rounded-full" />

                  {/* Active/Completed Line */}
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted || isActive ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute inset-0 bg-gradient-to-r from-accent to-purple-500 rounded-full"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile Labels */}
      <div className="flex justify-center mt-4">
        <span className="text-sm text-white/60">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.label}
        </span>
      </div>
    </nav>
  );
}

export default StepIndicator;
