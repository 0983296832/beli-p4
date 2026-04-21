import { useDevice } from '@hooks/useDevice';
import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Slider } from '@components/ui/slider';
import { cn } from '@lib/utils';

interface VolumeControlProps {
  defaultVolume?: number;
  onVolumeChange?: (volume: number) => void;
  className?: string;
  volumeClassName?: string;
}

export function VolumeControl({ defaultVolume = 50, onVolumeChange, className, volumeClassName }: VolumeControlProps) {
  const [volume, setVolume] = useState(defaultVolume);
  const [previousVolume, setPreviousVolume] = useState(defaultVolume);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useDevice();

  // Click outside (mobile)
  useEffect(() => {
    if (!isMobile) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
      onVolumeChange?.(0);
    } else {
      const newVolume = previousVolume || 50;
      setVolume(newVolume);
      onVolumeChange?.(newVolume);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className='h-5 w-5' />;
    if (volume < 50) return <Volume1 className='h-5 w-5' />;
    return <Volume2 className='h-5 w-5' />;
  };

  const handleButtonClick = () => {
    if (isMobile) setIsOpen((prev) => !prev);
    else toggleMute();
  };

  return (
    <div
      ref={containerRef}
      className={cn(`relative inline-flex items-center ${isMobile ? '' : 'group'} rounded-lg`, className)}
    >
      <Button
        size='icon'
        onClick={handleButtonClick}
        className='relative z-10 bg-inherit hover:bg-inherit rounded-lg px-6 py-5'
        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
      >
        {getVolumeIcon()}
      </Button>

      {/* Vùng hover nối giữa nút và popup */}
      <div
        className={cn(
          'absolute top-full left-1/2 -translate-x-1/2 h-3 w-10', // tăng nhẹ h và w
          'bg-transparent pointer-events-none group-hover:pointer-events-auto',
          'transition-opacity duration-200 ease-in-out'
        )}
      />

      {/* Popup volume */}
      <div
        className={cn(
          'absolute top-full mt-2 origin-top transition-all duration-200 ease-in-out rounded-lg bg-white', // 👈 thêm mt-2
          'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto',
          isMobile && isOpen && 'opacity-100 scale-100 pointer-events-auto',
          isMobile ? 'right-0' : 'left-1/2 -translate-x-1/2'
        )}
      >
        <div className={cn('flex items-center gap-2 rounded-lg border p-3 shadow-lg bg-white', 'flex-row w-40')}>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            orientation={'horizontal'}
            className={cn('w-full')}
            rangeClassName={volumeClassName}
            aria-label='Volume'
          />
          <span className='text-xs text-neutral-700 min-w-[2rem] text-center'>{Math.round(volume)}%</span>
        </div>
      </div>
    </div>
  );
}
