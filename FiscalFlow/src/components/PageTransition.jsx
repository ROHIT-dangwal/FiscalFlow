import { motion } from "framer-motion";

const PageTransition = ({ children }) => {
  const anim = (variants) => ({
    initial: "initial",
    animate: "animate",
    exit: "exit",
    variants,
  });

  const slideIn = {
    initial: { scaleY: 0 },
    animate: { scaleY: 0 },
    exit: { 
      scaleY: 1,
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } 
    },
  };

  const slideOut = {
    initial: { scaleY: 1 },
    animate: { 
      scaleY: 0,
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } 
    },
    exit: { scaleY: 0 },
  };

  return (
    <>
      <motion.div
        {...anim(slideIn)}
        className="fixed top-0 left-0 w-full h-screen bg-[#0f0f0f] origin-bottom z-[9999] pointer-events-none"
      />
      
      <motion.div
        {...anim(slideOut)}
        className="fixed top-0 left-0 w-full h-screen bg-[#0f0f0f] origin-top z-[9999] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.5 } }}
        exit={{ opacity: 0 }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default PageTransition;