import React, { useEffect, useRef, useState } from 'react';

interface InteractiveBackgroundProps {
  interactive?: boolean;
}

export const InteractiveBackground: React.FC<InteractiveBackgroundProps> = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Smooth interpolated scroll position (lerped at 60fps)
  const animFrameRef = useRef<number | null>(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const targetScrollYRef = useRef(0);
  const currentScrollYRef = useRef(0);

  // Refs for direct GPU transform manipulation for ultra-smooth 60fps without React re-render lag
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);
  const blob4Ref = useRef<HTMLDivElement>(null);
  const blob5Ref = useRef<HTMLDivElement>(null);
  const gridPatternRef = useRef<HTMLDivElement>(null);
  const gradientMeshRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    const updateScrollTarget = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? Math.min(Math.max(scrollY / totalHeight, 0), 1) : 0;

      targetProgressRef.current = progress;
      targetScrollYRef.current = scrollY;
    };

    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    window.addEventListener('resize', updateScrollTarget, { passive: true });
    updateScrollTarget();

    // 60fps smooth RAF Loop with lerp settling
    let isRunning = true;
    const animate = () => {
      if (!isRunning) return;

      if (!mediaQuery.matches) {
        // Linear interpolation for silky continuous damping & natural settle
        const lerpFactor = 0.065;
        const progressDiff = targetProgressRef.current - currentProgressRef.current;
        const scrollDiff = targetScrollYRef.current - currentScrollYRef.current;

        if (Math.abs(progressDiff) > 0.0001 || Math.abs(scrollDiff) > 0.1) {
          currentProgressRef.current += progressDiff * lerpFactor;
          currentScrollYRef.current += scrollDiff * lerpFactor;

          const p = currentProgressRef.current;
          const sy = currentScrollYRef.current;

          // Apply direct GPU 3D transforms for maximum 60fps responsiveness
          if (blob1Ref.current) {
            // Burgundy Blob - shifts horizontally & vertically with scroll
            const x = Math.sin(p * Math.PI * 2) * 60;
            const y = sy * 0.12;
            blob1Ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${1 + p * 0.15})`;
          }

          if (blob2Ref.current) {
            // Teal Blob - counter-shifts with depth
            const x = -Math.sin(p * Math.PI * 2) * 70;
            const y = sy * 0.08;
            blob2Ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${1 + (1 - p) * 0.12})`;
          }

          if (blob3Ref.current) {
            // Sapphire Blue Blob - center float
            const x = Math.cos(p * Math.PI * 2) * 50;
            const y = -sy * 0.07;
            blob3Ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${1 + Math.sin(p * Math.PI) * 0.2})`;
          }

          if (blob4Ref.current) {
            // Purple Violet Blob - rises from lower section
            const x = -Math.cos(p * Math.PI * 2) * 60;
            const y = -sy * 0.1;
            blob4Ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${0.95 + p * 0.2})`;
          }

          if (blob5Ref.current) {
            // Amber / Crimson Center Core
            const y = sy * 0.05;
            blob5Ref.current.style.transform = `translate3d(0, ${y}px, 0) scale(${1 + Math.cos(p * Math.PI) * 0.1})`;
          }

          if (gridPatternRef.current) {
            // Subtle optical grid parallax
            const y = (sy * 0.04) % 48;
            gridPatternRef.current.style.transform = `translate3d(0, ${-y}px, 0)`;
          }

          if (gradientMeshRef.current) {
            // Smooth gradient angle & position shift
            const angle = 135 + p * 60;
            gradientMeshRef.current.style.filter = `hue-rotate(${p * 20}deg)`;
          }

          setScrollProgress(p);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      window.removeEventListener('scroll', updateScrollTarget);
      window.removeEventListener('resize', updateScrollTarget);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Dynamic Ambient Mesh Gradient Base */}
      <div
        ref={gradientMeshRef}
        className="absolute inset-0 bg-gradient-to-br from-[#E3C1B4] via-[#E8CCC1] to-[#DFB8A9] dark:from-[#0A0D14] dark:via-[#0F172A] dark:to-[#080B11] transition-colors duration-700"
      />

      {/* Dynamic Animated Ambient Blobs (Teal, Blue, Purple, Burgundy, Amber) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Blob 1: Burgundy & Ruby Accent - Top Left */}
        <div
          ref={blob1Ref}
          className={`ambient-orb absolute -top-[12%] -left-[10%] w-[58vw] h-[58vw] max-w-[760px] max-h-[760px] rounded-full blur-[110px] pointer-events-none will-change-transform opacity-30 dark:opacity-25 ${
            reducedMotion ? '' : 'animate-ambient-slow-1'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(176, 42, 58, 0.45) 0%, rgba(176, 42, 58, 0.12) 45%, transparent 70%)',
          }}
        />

        {/* Blob 2: Verification Teal & Emerald Accent - Upper Right */}
        <div
          ref={blob2Ref}
          className={`ambient-orb absolute top-[18%] -right-[12%] w-[54vw] h-[54vw] max-w-[720px] max-h-[720px] rounded-full blur-[120px] pointer-events-none will-change-transform opacity-25 dark:opacity-25 ${
            reducedMotion ? '' : 'animate-ambient-slow-2'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(15, 118, 110, 0.4) 0%, rgba(15, 118, 110, 0.1) 48%, transparent 70%)',
          }}
        />

        {/* Blob 3: Royal Sapphire & Cyan Blue Accent - Mid Left to Center */}
        <div
          ref={blob3Ref}
          className={`ambient-orb absolute top-[45%] -left-[15%] w-[52vw] h-[52vw] max-w-[680px] max-h-[680px] rounded-full blur-[130px] pointer-events-none will-change-transform opacity-20 dark:opacity-25 ${
            reducedMotion ? '' : 'animate-ambient-slow-3'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, rgba(15, 118, 110, 0.12) 50%, transparent 70%)',
          }}
        />

        {/* Blob 4: Amethyst & Deep Violet Accent - Bottom Right */}
        <div
          ref={blob4Ref}
          className={`ambient-orb absolute -bottom-[10%] right-[10%] w-[56vw] h-[56vw] max-w-[740px] max-h-[740px] rounded-full blur-[135px] pointer-events-none will-change-transform opacity-20 dark:opacity-25 ${
            reducedMotion ? '' : 'animate-ambient-slow-1'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, rgba(176, 42, 58, 0.12) 48%, transparent 70%)',
          }}
        />

        {/* Blob 5: Warm Coral & Golden Amber Glow - Center Floating Anchor */}
        <div
          ref={blob5Ref}
          className={`ambient-orb absolute top-[30%] left-[28%] w-[42vw] h-[42vw] max-w-[560px] max-h-[560px] rounded-full blur-[140px] pointer-events-none will-change-transform opacity-15 dark:opacity-20 ${
            reducedMotion ? '' : 'animate-ambient-slow-2'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(176, 42, 58, 0.08) 50%, transparent 70%)',
          }}
        />
      </div>

      {/* Floating Micro-Particles & Optical Document Nodes */}
      <div className="absolute inset-0 opacity-40 dark:opacity-60 transition-opacity duration-500">
        {/* Floating Particle 1 - Teal Verification Node */}
        <div
          className="particle absolute w-2.5 h-2.5 rounded-full bg-[#0F766E] shadow-[0_0_12px_#0F766E]"
          style={{
            top: '18%',
            left: '12%',
            animation: reducedMotion ? 'none' : 'floatParticle 18s ease-in-out infinite',
            animationDelay: '0s',
          }}
        />

        {/* Floating Particle 2 - Burgundy Optical Pulse */}
        <div
          className="particle absolute w-3 h-3 rounded-full bg-[#B02A3A] shadow-[0_0_14px_#B02A3A]"
          style={{
            top: '42%',
            right: '16%',
            animation: reducedMotion ? 'none' : 'floatParticle 22s ease-in-out infinite reverse',
            animationDelay: '2s',
          }}
        />

        {/* Floating Particle 3 - Blue Sapphire Spark */}
        <div
          className="particle absolute w-2 h-2 rounded-full bg-[#2563EB] shadow-[0_0_10px_#2563EB]"
          style={{
            top: '64%',
            left: '22%',
            animation: reducedMotion ? 'none' : 'floatParticle 20s ease-in-out infinite',
            animationDelay: '3s',
          }}
        />

        {/* Floating Particle 4 - Violet Node */}
        <div
          className="particle absolute w-2 h-2 rounded-full bg-[#7C3AED] shadow-[0_0_10px_#7C3AED]"
          style={{
            top: '82%',
            right: '28%',
            animation: reducedMotion ? 'none' : 'floatParticle 24s ease-in-out infinite reverse',
            animationDelay: '5s',
          }}
        />

        {/* Floating Particle 5 - Complementary Teal Ping */}
        <div
          className="particle absolute w-2 h-2 rounded-full bg-[#0F766E] shadow-[0_0_10px_#0F766E]"
          style={{
            top: '26%',
            left: '78%',
            animation: reducedMotion ? 'none' : 'floatParticle 19s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />
      </div>

      {/* Subtle Document Grid Lines with Parallax Scrolling */}
      <div ref={gridPatternRef} className="absolute inset-0 w-full h-full will-change-transform">
        <svg
          className="w-full h-[120%] opacity-[0.04] dark:opacity-[0.07] transition-opacity duration-500"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="doc-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-slate-800 dark:text-slate-200"
              />
              {/* Subtle alignment corner registration crosshair */}
              <circle cx="24" cy="24" r="0.8" fill="#0F766E" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#doc-grid)" />
        </svg>
      </div>

      {/* Document Scanning Laser Beam (Subtle, Slow, Verification Effect) */}
      {!reducedMotion && (
        <div className="absolute inset-x-0 h-40 scanning-laser pointer-events-none opacity-25 dark:opacity-35" />
      )}

      {/* Geometric Watermark Vectors with Subtle Depth Rotation */}
      <div
        className="absolute right-[-4%] top-[12%] w-[420px] h-[520px] border border-[#0F766E]/10 dark:border-[#0F766E]/15 rounded-[36px] -rotate-12 pointer-events-none transition-transform duration-700"
        style={{
          transform: `rotate(${-12 + scrollProgress * 6}deg) translate3d(0, ${scrollProgress * 20}px, 0)`,
        }}
      />
      <div
        className="absolute right-[-2%] top-[16%] w-[380px] h-[480px] border border-[#B02A3A]/10 dark:border-[#B02A3A]/15 rounded-[32px] -rotate-6 pointer-events-none transition-transform duration-700"
        style={{
          transform: `rotate(${-6 - scrollProgress * 4}deg) translate3d(0, ${scrollProgress * 30}px, 0)`,
        }}
      />
      <div
        className="absolute left-[-6%] bottom-[10%] w-[440px] h-[540px] border border-[#2563EB]/10 dark:border-[#7C3AED]/15 rounded-[40px] rotate-12 pointer-events-none transition-transform duration-700"
        style={{
          transform: `rotate(${12 + scrollProgress * 8}deg) translate3d(0, ${-scrollProgress * 25}px, 0)`,
        }}
      />
    </div>
  );
};
