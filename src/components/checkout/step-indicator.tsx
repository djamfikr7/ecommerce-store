'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Truck, CreditCard, FileCheck } from 'lucide-react'

export type CheckoutStep = 'shipping' | 'payment' | 'review'

interface StepConfig {
  id: CheckoutStep
  label: string
  icon: typeof Truck
}

const steps: StepConfig[] = [
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: FileCheck },
]

interface StepIndicatorProps {
  currentStep: CheckoutStep
  completedSteps: CheckoutStep[]
  onStepClick?: (step: CheckoutStep) => void
}

export function StepIndicator({ currentStep, completedSteps, onStepClick }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <nav aria-label="Checkout progress" className="w-full py-6">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = completedSteps.includes(step.id)
          const Icon = step.icon
          const isClickable = isCompleted && onStepClick

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <motion.button
                  type="button"
                  onClick={isClickable ? () => onStepClick(step.id) : undefined}
                  disabled={!isClickable}
                  initial={false}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  {...(isClickable && { whileHover: { scale: 1.05 } })}
                  className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${isCompleted ? 'bg-accent-primary' : ''} ${isActive ? 'shadow-accent-primary/50 bg-accent-primary shadow-lg' : ''} ${!isActive && !isCompleted ? 'neo-raised-sm bg-surface-elevated' : ''} ${isClickable ? 'cursor-pointer' : 'cursor-default'} `}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="h-6 w-6 text-white" />
                    </motion.div>
                  ) : (
                    <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  )}

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
                      className="bg-accent-primary/50 absolute inset-0 -z-10 rounded-full blur-md"
                    />
                  )}
                </motion.button>

                <span
                  className={`mt-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : ''} ${isCompleted ? 'text-accent-primary' : ''} ${!isActive && !isCompleted ? 'text-slate-400' : ''} ${isClickable ? 'cursor-pointer hover:text-white' : ''} `}
                  onClick={isClickable ? () => onStepClick(step.id) : undefined}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="relative mx-4 -mt-8 h-0.5 flex-1">
                  <div className="bg-border-default absolute inset-0 rounded-full" />
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? '100%' : isActive ? '50%' : '0%',
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-primary to-purple-500"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex justify-center">
        <span className="text-sm text-white/60">
          Step {currentIndex + 1} of {steps.length}: {steps[currentIndex]?.label}
        </span>
      </div>
    </nav>
  )
}

export default StepIndicator
