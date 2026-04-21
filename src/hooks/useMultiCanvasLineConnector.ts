import { useEffect, useRef } from 'react';

type Connection = { top: string; bottom: string };
type LineStyle = 'solid' | 'dashed' | 'dotted';

type Props = {
  connections: Connection[];
  color?: string;
  style?: LineStyle;
};

export const useMultiCanvasLineConnector = ({ connections, color = 'black', style = 'solid' }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevConnectionsRef = useRef<string>(''); // lưu hash để so sánh mảng

  const hashConnections = (conns: Connection[]) =>
    conns
      .map((c) => `${c.top}->${c.bottom}`)
      .sort()
      .join('|');

  useEffect(() => {
    const currentHash = hashConnections(connections);
    if (currentHash === prevConnectionsRef.current) return;
    prevConnectionsRef.current = currentHash;

    // Cleanup canvas cũ nếu có
    if (canvasRef.current) {
      canvasRef.current.remove();
      canvasRef.current = null;
    }

    // Tạo canvas mới
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    canvas.id = 'multi-line-connector-canvas';
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      canvas.width = document.body.scrollWidth;
      canvas.height = document.body.scrollHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const { top, bottom } of connections) {
        const topEl = document.getElementById(top);
        const bottomEl = document.getElementById(bottom);
        if (!topEl || !bottomEl) continue;

        const rectA = topEl.getBoundingClientRect();
        const rectB = bottomEl.getBoundingClientRect();

        const startX = rectA.left + rectA.width / 2 + window.scrollX;
        const startY = rectA.top + rectA.height / 2 + window.scrollY;
        const endX = rectB.left + rectB.width / 2 + window.scrollX;
        const endY = rectB.top + rectB.height / 2 + window.scrollY;

        ctx.beginPath();
        ctx.setLineDash(getDash(style));
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
      }
    };

    const getDash = (s: LineStyle) => {
      switch (s) {
        case 'dashed':
          return [6, 4];
        case 'dotted':
          return [2, 2];
        default:
          return [0, 0];
      }
    };

    draw();
    window.addEventListener('resize', draw);
    window.addEventListener('scroll', draw);

    return () => {
      window.removeEventListener('resize', draw);
      window.removeEventListener('scroll', draw);
      canvas.remove();
      canvasRef.current = null;
    };
  }, [connections, color, style]);
};
