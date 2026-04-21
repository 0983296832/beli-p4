import React, { useState, useEffect } from 'react';
import { Volume2, Square, AlertCircle } from 'lucide-react';
import { cn } from '@lib/utils';
import { useT } from '@hooks/useT';
import TooltipUi from '../tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@components/ui/dialog';
import { Button } from '@components/ui/button';

const SmartHtmlSpeaker = ({ html, className }: { html: string; className?: string }) => {
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [missingEnglishVoice, setMissingEnglishVoice] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openZaloDialog, setOpenZaloDialog] = useState(false);
  const { t } = useT();

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const isZaloWebView = () => navigator.userAgent.toLowerCase().includes('zalo');

  useEffect(() => {
    console.log(navigator.userAgent);
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        let englishVoice: SpeechSynthesisVoice | null = null;

        if (isIOS) {
          englishVoice =
            voices.find((v) => v.name.includes('Samantha')) ||
            voices.find((v) => v.name.includes('Daniel')) ||
            voices.find((v) => v.lang.startsWith('en')) ||
            null;
        } else {
          englishVoice =
            voices.find(
              (v) =>
                v.lang.startsWith('en') && /(female|zira|aria|google us english|woman|amy|jenny|emma)/i.test(v.name)
            ) ||
            voices.find((v) => v.lang.startsWith('en')) ||
            null;
        }

        setVoice(englishVoice);
        setVoicesLoaded(true);
        setMissingEnglishVoice(!englishVoice);
      }
    };
    if (!isZaloWebView()) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [isIOS, navigator.userAgent]);

  const handleSpeak = () => {
    console.log(isZaloWebView());
    if (isZaloWebView()) {
      setOpenZaloDialog(true);
      return;
    }

    if (!voicesLoaded) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    let text = new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
    text = text.replace(/_{3,}/g, '__').trim();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 1;
    utter.pitch = 1.05;
    utter.voice = voice || null;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  return (
    <div className='flex flex-col items-center gap-2'>
      <TooltipUi description={t('listen_prompt')}>
        <button
          onClick={() => {
            if (isIOS && missingEnglishVoice) {
              setOpenDialog(true);
              return;
            }
            handleSpeak();
          }}
          className={cn(
            'p-2 rounded-full transition-colors duration-200 bg-orange-100 text-orange-600',
            className,
            !voice && 'opacity-50 cursor-not-allowed'
          )}
        >
          {speaking ? <Square className='size-3 sm:size-4' /> : <Volume2 className='size-3 sm:size-4' />}
        </button>
      </TooltipUi>

      {/* Dialog hướng dẫn iOS voice */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-red-600'>
              <AlertCircle className='w-4 h-4' />
              {t('ios_en_voice_setup')}
            </DialogTitle>
            <DialogDescription className='space-y-2 text-sm leading-relaxed text-neutral-600'>
              <p dangerouslySetInnerHTML={{ __html: t('ios_en_voice_missing') }} />
              <ul className='list-disc list-inside space-y-1'>
                <li dangerouslySetInnerHTML={{ __html: t('open_settings') }} />
                <li dangerouslySetInnerHTML={{ __html: t('choose_accessibility') }} />
                <li dangerouslySetInnerHTML={{ __html: t('choose_english_voice') }} />
              </ul>
              <p
                className='pt-2 text-xs italic text-gray-500'
                dangerouslySetInnerHTML={{ __html: t('retry_after_download') }}
              />
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end'>
            <Button onClick={() => setOpenDialog(false)} className='bg-orange-500 hover:bg-orange-600'>
              {t('got_it')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ⚠️ Dialog cảnh báo Zalo */}
      <Dialog open={openZaloDialog} onOpenChange={setOpenZaloDialog}>
        <DialogContent className='max-w-sm text-center rounded-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-center gap-2 text-red-600'>
              <AlertCircle className='w-5 h-5' />
              {t('zalo_browser_not_supported_title')}
            </DialogTitle>
            <DialogDescription className='text-sm text-neutral-600 leading-relaxed'>
              {t('zalo_browser_not_supported_msg')}
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-center'>
            <Button onClick={() => setOpenZaloDialog(false)} className='bg-orange-500 hover:bg-orange-600'>
              {t('got_it')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartHtmlSpeaker;
