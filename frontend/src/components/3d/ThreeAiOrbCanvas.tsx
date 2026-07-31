import React, { useEffect, useRef } from 'react';

interface ThreeAiOrbCanvasProps {
  className?: string;
  orbColor?: string;
}

export const ThreeAiOrbCanvas: React.FC<ThreeAiOrbCanvasProps> = ({
  className = '',
  orbColor = '#8B5CF6'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse reactive state
    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 3D Particles Node Sphere + Orbital Rings
    const particleCount = 135;
    const radius = Math.min(width, height) * 0.28;
    const particles: Array<{
      baseX: number;
      baseY: number;
      baseZ: number;
      size: number;
      pulse: number;
      speed: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      const r = radius * (0.75 + 0.35 * Math.random());

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      particles.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        size: Math.random() * 2.8 + 1,
        pulse: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.02,
      });
    }

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      // Smooth lerp mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Mouse influence on rotation
      angleY += 0.007 + (mouse.x - centerX) * 0.00004;
      angleX += 0.003 + (mouse.y - centerY) * 0.00004;

      const sinX = Math.sin(angleX);
      const cosX = Math.cos(angleX);
      const sinY = Math.sin(angleY);
      const cosY = Math.cos(angleY);

      // Radial background aura glow
      const auraGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        15,
        centerX,
        centerY,
        radius * 1.6
      );
      auraGlow.addColorStop(0, 'rgba(147, 51, 234, 0.28)');
      auraGlow.addColorStop(0.4, 'rgba(99, 102, 241, 0.14)');
      auraGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');

      ctx.fillStyle = auraGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.7, 0, Math.PI * 2);
      ctx.fill();

      // Transform 3D particles
      const projected: Array<{ x: number; y: number; z: number; size: number }> = [];

      particles.forEach((p) => {
        p.pulse += p.speed;
        const scaleFactor = (radius + Math.sin(p.pulse) * 8) / radius;

        // Rotation matrix
        let x = p.baseX * scaleFactor;
        let y = p.baseY * scaleFactor;
        let z = p.baseZ * scaleFactor;

        // Rotate Y
        let x1 = x * cosY - z * sinY;
        let z1 = z * cosY + x * sinY;

        // Rotate X
        let y2 = y * cosX - z1 * sinX;
        let z2 = z1 * cosX + y * sinX;

        // Perspective projection
        const fov = 420;
        const scale = fov / (fov + z2 + 260);
        const px = centerX + x1 * scale;
        const py = centerY + y2 * scale;

        projected.push({ x: px, y: py, z: z2, size: p.size * scale });
      });

      // Draw neural connections between close projected particles
      ctx.lineWidth = 0.7;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 68) {
            const alpha = (1 - dist / 68) * 0.38;
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes with depth opacity
      projected.forEach((p) => {
        const opacity = Math.max(0.25, (p.z + radius) / (radius * 2));
        ctx.fillStyle = `rgba(192, 132, 252, ${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.fill();
      });

      // Rotating 3D Outer Ring
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.22)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.25, radius * 0.4, angleY * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [orbColor]);

  return (
    <div className={`relative overflow-hidden w-full h-full flex items-center justify-center ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
