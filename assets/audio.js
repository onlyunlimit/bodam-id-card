let context;
export function soundContext() {
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)return null;
  context ||= new Audio();
  return context;
}
export async function chirp(frequency=960) {
  try {
    const ctx=soundContext();if(!ctx)return;
    await ctx.resume();const start=ctx.currentTime;
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type='sine';osc.frequency.setValueAtTime(frequency,start);osc.frequency.exponentialRampToValueAtTime(frequency*.6,start+.12);
    gain.gain.setValueAtTime(.055,start);gain.gain.exponentialRampToValueAtTime(.0001,start+.18);
    osc.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(start+.2);
    osc.onended=()=>{osc.disconnect();gain.disconnect();};
  } catch { /* A blocked sound must never block navigation. */ }
}
