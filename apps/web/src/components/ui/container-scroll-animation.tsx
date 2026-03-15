"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = () => (isMobile ? [0.7, 0.9] : [1.05, 1]);

  const rotate    = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale     = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      ref={containerRef}
      style={{
        height: isMobile ? '60rem' : '80rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', padding: isMobile ? '8px' : '80px',
      }}
    >
      <div style={{ paddingTop: isMobile ? '40px' : '160px', paddingBottom: isMobile ? '40px' : '160px', width: '100%', position: 'relative', perspective: '1000px' }}>
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: { translate: MotionValue<number>; titleComponent: React.ReactNode }) => (
  <motion.div style={{ translateY: translate, maxWidth: '64rem', margin: '0 auto', textAlign: 'center' }}>
    {titleComponent}
  </motion.div>
);

export const Card = ({
  rotate, scale, children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => (
  <motion.div
    style={{
      rotateX: rotate,
      scale,
      boxShadow: '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
      maxWidth: '64rem',
      marginTop: '-48px',
      marginLeft: 'auto',
      marginRight: 'auto',
      height: '40rem',
      width: '100%',
      border: '2px solid rgba(212,175,55,0.25)',
      padding: '6px',
      background: '#111',
      borderRadius: '28px',
    }}
  >
    <div style={{ height: '100%', width: '100%', overflow: 'hidden', borderRadius: '22px', background: '#0a0a0a' }}>
      {children}
    </div>
  </motion.div>
);
