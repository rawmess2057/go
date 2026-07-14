"use client";

import { motion } from "framer-motion";
import { useSolPrice } from "@/hooks/useSolPrice";
import { useGigCreateStore } from "@/stores/useGigCreateStore";

export default function UsdDisplay() {
  const amount = useGigCreateStore((s) => s.amount);
  const solPrice = useSolPrice();

  if (!solPrice) return null;

  const numVal = parseFloat(amount) || 0;
  const usdValue = numVal * solPrice;

  return (
    <motion.p
      key={usdValue.toFixed(2)}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xs text-muted-foreground mt-1"
    >
      ≈ ${usdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
    </motion.p>
  );
}
