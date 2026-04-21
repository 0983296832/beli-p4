import { useState, useEffect, useImperativeHandle, forwardRef, memo } from 'react';
import { useT } from '@hooks/useT';

export interface CountdownTimerHandle {
  pause: () => void;
  reset: () => void;
  start: () => void;
}

interface CountdownTimerProps {
  minutes: number;
  start: boolean;
  onComplete?: () => void;
  onRender: (time: string) => React.ReactElement;
}

const CountdownTimerComponent = forwardRef<CountdownTimerHandle, CountdownTimerProps>(
  ({ minutes, start, onComplete, onRender }, ref) => {
    const [timeLeft, setTimeLeft] = useState(minutes * 60);
    const [isRunning, setIsRunning] = useState(start);

    const { t } = useT();
    // Để dùng được từ bên ngoài
    useImperativeHandle(ref, () => ({
      pause: () => setIsRunning(false),
      start: () => setIsRunning(true),
      reset: () => {
        setIsRunning(false);
        setTimeLeft(minutes * 60);
        setIsRunning(true); // <-- CHẠY LẠI NGAY
      }
    }));

    // Khi prop start đổi thành true thì chạy
    useEffect(() => {
      if (start) {
        setTimeLeft(minutes * 60);
        setIsRunning(true);
      } else {
        setTimeLeft(minutes * 60);
        setIsRunning(false);
      }
    }, [start, minutes]);

    // Timer chạy khi isRunning = true
    useEffect(() => {
      if (!isRunning) return;

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, '0');
      const m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    };

    return <>{onRender(formatTime(timeLeft))}</>;
  }
);

const CountdownTimer = memo(CountdownTimerComponent);

export default CountdownTimer;
