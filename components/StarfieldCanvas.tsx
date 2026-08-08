'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  radius: number;
  opacity: number;
  color: string;
  vx?: number;
  vy?: number;
}

export default function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 設定 canvas 尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 初始化星星
    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 50 : 200;
    const colors = ['#ffffff', '#87ceeb', '#dda0dd'];

    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random(),
      radius: Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
    }));

    // 流星
    let meteorTimer = 0;
    const meteorInterval = 5000 + Math.random() * 5000;

    const drawStars = () => {
      // 清空背景
      ctx.fillStyle = '#0a0b0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 繪製星星
      stars.forEach((star) => {
        // 更新位置（緩慢移動）
        if (star.vx && star.vy) {
          star.x += star.vx;
          star.y += star.vy;

          // 邊界環繞
          if (star.x < 0) star.x = canvas.width;
          if (star.x > canvas.width) star.x = 0;
          if (star.y < 0) star.y = canvas.height;
          if (star.y > canvas.height) star.y = 0;
        }

        // 繪製星星
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // 近處星星的脈衝光環
        if (star.z > 0.7) {
          ctx.strokeStyle = star.color;
          ctx.globalAlpha = star.opacity * 0.3;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;

      // 流星效果
      meteorTimer += 16;
      if (meteorTimer > meteorInterval) {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height * 0.3;
        const endX = startX + 100 + Math.random() * 100;
        const endY = startY + 150 + Math.random() * 100;

        // 繪製流星
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        meteorTimer = 0;
      }

      requestAnimationFrame(drawStars);
    };

    drawStars();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ display: 'block' }}
    />
  );
}
