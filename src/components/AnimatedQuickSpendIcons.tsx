import { motion } from 'motion/react';

export const AnimatedCart = ({ isActive, size = 24, className = "" }: any) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    animate={isActive ? { x: [0, 3, -1, 0] } : {}}
    transition={{ duration: 0.24, ease: "easeOut" }}
  >
    <circle cx="8" cy="21" r="1"/>
    <circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </motion.svg>
);

export const AnimatedStore = ({ isActive, size = 24, className = "" }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <motion.path 
      d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"
      style={{ transformOrigin: '11px 22px' }}
      animate={isActive ? { skewY: [0, -15, 0], scaleX: [1, 0.6, 1] } : {}}
      transition={{ duration: 0.24, ease: "easeOut" }}
    />
    <path d="M2 9.782a2 2 0 0 0 2.14 1.986h.04a2 2 0 0 0 1.96-2.008V8h4v1.76a2 2 0 0 0 1.96 2.008h.04a2 2 0 0 0 2.14-1.986L14 8h4v1.76a2 2 0 0 0 1.96 2.008h.04a2 2 0 0 0 2.14-1.986L22 8H2z"/>
  </svg>
);

export const AnimatedFuel = ({ isActive, size = 24, className = "" }: any) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    animate={isActive ? { filter: ["drop-shadow(0px 0px 0px rgba(0,0,0,0))", "drop-shadow(0px 0px 5px currentColor)", "drop-shadow(0px 0px 0px rgba(0,0,0,0))"] } : {}}
    transition={{ duration: 0.24, ease: "easeOut" }}
  >
    <line x1="3" x2="15" y1="22" y2="22"/>
    <line x1="4" x2="14" y1="9" y2="9"/>
    <rect height="18" width="10" x="4" y="4" rx="2" ry="2"/>
    <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>
  </motion.svg>
);

export const AnimatedUtensils = ({ isActive, size = 24, className = "" }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <motion.g
      style={{ transformOrigin: '7px 22px' }}
      animate={isActive ? { rotate: [0, 12, 0] } : {}}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
    </motion.g>
    <motion.g
      style={{ transformOrigin: '18px 22px' }}
      animate={isActive ? { rotate: [0, -12, 0] } : {}}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </motion.g>
  </svg>
);

export const AnimatedShoppingBag = ({ isActive, size = 24, className = "" }: any) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    animate={isActive ? { scale: [1, 1.15, 1] } : {}}
    transition={{ duration: 0.24, ease: "easeOut" }}
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
    <path d="M3 6h18"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </motion.svg>
);

export const AnimatedTarget = ({ isActive, size = 24, className = "" }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <motion.circle 
      cx="12" 
      cy="12" 
      r="2"
      animate={isActive ? { r: [2, 5, 2] } : {}}
      transition={{ duration: 0.24, ease: "easeOut" }}
    />
  </svg>
);
