import { Variant, Variants } from 'framer-motion';

interface Options {
  open?: Variant;
  closed?: Variant;
}

export function containerVariants(opt?: Options): Variants {
  return {
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
        staggerChildren: 0.05, // Animasi stagger untuk anak-anaknya
        delayChildren: 0.1 // Delay sebelum anak-anak mulai animasi
      },
      ...opt?.open
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
        staggerChildren: 0.05,
        staggerDirection: -1 // Animasi mundur saat menutup
        // when: 'afterChildren' // Tunggu hingga anak-anak selesai animasi
      },
      ...opt?.closed
    }
  };
}

export function itemVariants(opt?: Options): Variants {
  return {
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 22.5
      },
      ...opt?.open
    },
    closed: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 22.5
      },
      ...opt?.closed
    }
  };
}
