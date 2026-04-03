'use client';
import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';

let audioCtx: AudioContext | null = null;

function getAudioCtx() {
  if (!audioCtx && typeof window !== 'undefined') {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, gain: number) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = 'sine';
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function useAudioCues() {
  const audioEnabled = useAppStore((s) => s.audioEnabled);

  const tick = useCallback(() => {
    if (!audioEnabled) return;
    playTone(1200, 0.06, 0.04);
  }, [audioEnabled]);

  const thud = useCallback(() => {
    if (!audioEnabled) return;
    playTone(80, 0.18, 0.08);
  }, [audioEnabled]);

  return { tick, thud };
}
