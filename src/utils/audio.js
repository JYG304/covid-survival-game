/**
 * 音频系统 - Web Audio API 合成器
 * 使用程序化音频合成，无需外部音频文件
 */

class WebAudioSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq = 440, duration = 0.15, type = 'sine', vol = 0.1) {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) {
      console.warn('Audio playback failed:', e);
    }
  }

  playCash() {
    this.playTone(523, 0.08, 'triangle', 0.1);
    setTimeout(() => this.playTone(659, 0.12, 'triangle', 0.1), 70);
  }

  playWarning() {
    this.playTone(220, 0.2, 'sawtooth', 0.12);
    setTimeout(() => this.playTone(180, 0.25, 'sawtooth', 0.12), 150);
  }

  playCough() {
    this.playTone(140, 0.09, 'sawtooth', 0.08);
  }

  playSip() {
    this.playTone(480, 0.15, 'sine', 0.08);
    setTimeout(() => this.playTone(640, 0.18, 'sine', 0.08), 80);
  }

  playClick() {
    this.playTone(800, 0.04, 'square', 0.05);
  }
}

export const audio = new WebAudioSynth();
