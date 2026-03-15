import * as React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface OrderConfirmationCardProps {
  orderId: string;
  paymentMethod: string;
  dateTime: string;
  totalAmount: string;
  onGoToAccount: () => void;
  title?: string;
  buttonText?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const OrderConfirmationCard: React.FC<OrderConfirmationCardProps> = ({
  orderId,
  paymentMethod,
  dateTime,
  totalAmount,
  onGoToAccount,
  title = "Your order has been submitted",
  buttonText = "Go to my account",
  icon = <CheckCircle2 className="h-12 w-12 text-[#D4AF37]" />,
  className,
}) => {
  const details = [
    { label: "Order ID", value: orderId },
    { label: "Payment Method", value: paymentMethod },
    { label: "Date & Time", value: dateTime },
    { label: "Total", value: totalAmount, isBold: true },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1, scale: 1,
      transition: { duration: 0.4, ease: "easeInOut", staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-live="polite"
        className={cn(
          "w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#1d1d1f] text-white shadow-2xl p-8",
          className,
        )}
      >
        <div className="flex flex-col items-center space-y-6 text-center">
          <motion.div variants={itemVariants}>{icon}</motion.div>
          <motion.h2 variants={itemVariants} className="text-2xl font-bold tracking-tight">
            {title}
          </motion.h2>
          <motion.div variants={itemVariants} className="w-full space-y-4 pt-4">
            {details.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-between border-b border-white/[0.07] pb-4 text-sm text-[#a1a1a6]",
                  { "border-none pb-0": index === details.length - 1 },
                  { "font-bold text-white": item.isBold },
                )}
              >
                <span>{item.label}</span>
                <span className={cn({ "text-lg": item.isBold })}>{item.value}</span>
              </div>
            ))}
          </motion.div>
          <motion.div variants={itemVariants} className="w-full pt-4">
            <button
              onClick={onGoToAccount}
              style={{
                width: "100%",
                height: 50,
                background: "#D4AF37",
                color: "#000",
                border: "none",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {buttonText}
            </button>
          </motion.div>
          <p style={{ fontSize: 12, color: "#6e6e73" }}>
            Credentials delivered to WhatsApp in under 5 minutes.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
