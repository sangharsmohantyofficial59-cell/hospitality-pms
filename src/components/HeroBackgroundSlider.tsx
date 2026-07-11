import React, { useEffect, useMemo, useRef, useState } from "react";

type HeroImage = {
  id: string;
  src: string;
  alt: string;
};

type Props = {
  images: HeroImage[];
};

/**
 * HeroBackgroundSlider
 * - Shows first image immediately (no delay, no white flash).
 * - Auto-rotates every 4 seconds with a smooth cross-fade (~700ms).
 * - Images render at full vibrancy — no opacity reduction on base image.
 * - Overlay handled by the parent container, not here.
 * - No external libraries.
 * - Responsive: fills the parent absolutely-positioned container.
 */
export default function HeroBackgroundSlider({ images }: Props) {
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter((i) => i?.src) : []),
    [images]
  );

  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeDuration = 700; // ms — smooth, responsive crossfade

  useEffect(() => {
    if (safeImages.length < 2) return;

    const rotate = () => {
      const nextIdx = (current + 1) % safeImages.length;
      setNext(nextIdx);
      setFading(true);

      timerRef.current = setTimeout(() => {
        setCurrent(nextIdx);
        setNext(null);
        setFading(false);
      }, fadeDuration);
    };

    const interval = setInterval(rotate, 4000); // 4-second interval
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, safeImages.length]);

  if (!safeImages.length) return null;

  const currentImg = safeImages[current];
  const nextImg = next !== null ? safeImages[next] : null;

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      {/* Base (current) image — full opacity for vibrant, sharp display */}
      <img
        key={currentImg.id}
        src={currentImg.src}
        alt={currentImg.alt || "Hotel hero"}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 1 }}
        referrerPolicy="no-referrer"
        draggable={false}
      />

      {/* Next image fades in on top during transition */}
      {nextImg && (
        <img
          key={nextImg.id}
          src={nextImg.src}
          alt={nextImg.alt || "Hotel hero"}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: fading ? 1 : 0,
            transition: `opacity ${fadeDuration}ms ease-in-out`,
          }}
          referrerPolicy="no-referrer"
          draggable={false}
        />
      )}
    </div>
  );
}
