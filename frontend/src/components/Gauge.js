// src/components/Gauge.js
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Gauge = ({ value, max, unit, color }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const angle = (percentage / 100) * 180;

  const pathRef = useRef(null);

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDasharray = length;
      pathRef.current.style.strokeDashoffset = length;
      pathRef.current.getBoundingClientRect(); // Trigger reflow
      pathRef.current.style.strokeDashoffset = length - (percentage / 100) * length;
    }
  }, [value, max]);

  return (
    <div className="relative w-full h-32">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* Fond de jauge */}
        <path
          d="M5 45 A45 45 0 0 1 95 45"
          fill="none"
          stroke="#333"
          strokeWidth="8"
        />
        {/* Jauge remplie */}
        <motion.path
          ref={pathRef}
          d={`M5 45 A45 45 0 0 1 ${5 + 90 * (angle / 180)} ${45 - 45 * Math.sin(angle * Math.PI / 180)} `}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDashoffset: 283 }}
          animate={{ strokeDashoffset: 283 - (percentage / 100) * 283 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
        {value} {unit}
      </div>
    </div>
  );
};

export default Gauge;