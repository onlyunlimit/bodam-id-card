let context;
export function soundContext() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return null;
  context ||= new Audio();
  return context;
}
export async function chirp(frequency = 960) {
  try {
    const ctx = soundContext();
    if (!ctx) return;
    await ctx.resume();
    const start = ctx.currentTime;
    const osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, start);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.6, start + 0.12);
    gain.gain.setValueAtTime(0.055, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.2);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  } catch {
    /* A blocked sound must never block navigation. */
  }
}

export async function keyClick() {
  try {
    const ctx = soundContext();
    if (!ctx) return;
    await ctx.resume();
    const t = ctx.currentTime,
      buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.055), ctx.sampleRate),
      samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++)
      samples[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
    const source = ctx.createBufferSource(),
      filter = ctx.createBiquadFilter(),
      gain = ctx.createGain();
    source.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.value = 1700;
    gain.gain.value = 0.17;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(t);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  } catch {}
}
