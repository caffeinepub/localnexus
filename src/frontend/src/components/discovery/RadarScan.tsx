import { useEffect, useState } from 'react';

export default function RadarScan() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 2) % 360);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-80 w-80">
      {/* Background radar image */}
      <div className="absolute inset-0 overflow-hidden rounded-full opacity-30">
        <img
          src="/assets/generated/radar-bg.dim_1200x800.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* Concentric circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-3/4 w-3/4 rounded-full border-2 border-primary/20" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-1/2 w-1/2 rounded-full border-2 border-primary/30" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-1/4 w-1/4 rounded-full border-2 border-primary/40" />
      </div>

      {/* Rotating sweep */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div
          className="h-full w-1 origin-bottom"
          style={{
            background: 'linear-gradient(to top, oklch(var(--primary)) 0%, transparent 100%)',
            boxShadow: '0 0 20px oklch(var(--primary) / 0.5)',
          }}
        />
      </div>

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-3 w-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
      </div>

      {/* Scanning text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="mt-32 text-sm font-medium text-primary">Scanning...</div>
      </div>
    </div>
  );
}
