'use client'

import { motion } from 'framer-motion'
import { Check, Truck, CreditCard, FileCheck } from 'lucide-react'

export type CheckoutStep = 'shipping' | 'payment' | 'review'

interface CheckoutStepsProps {
  currentStep: CheckoutStep
}

const steps = [
  { id: 'shipping' as CheckoutStep, label: 'Shipping', icon: Truck },
  { id: 'payment' as CheckoutStep, label: 'Payment', icon: CreditCard },
  { id: 'review' as CheckoutStep, label: 'Review', icon: FileCheck },
]

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="w-full py-6">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = index < currentIndex
          const Icon = step.icon

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                {/* Step Circle */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  className={`neo-raised-sm relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${isCompleted ? 'bg-accent-primary' : ''} ${isActive ? 'shadow-accent-primary/50 bg-accent-primary shadow-lg' : ''} ${!isActive && !isCompleted ? 'bg-surface-elevated' : ''} `}
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
                      className="bg-accent-primary/50 absolute inset-0 -z-10 rounded-full blur-md"
                    />
                  )}
                </motion.div>

                {/* Step Label */}
                <span
                  className={`mt-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : ''} ${isCompleted ? 'text-accent-primary' : ''} ${!isActive && !isCompleted ? 'text-slate-400' : ''} `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="relative mx-4 -mt-8 h-0.5 flex-1">
                  {/* Background Line */}
                  <div className="bg-border-default absolute inset-0 rounded-full" />

                  {/* Active/Completed Line */}
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? '100%' : '0%',
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
    </div>
  )
}
