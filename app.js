const $ = (selector) => document.querySelector(selector);
const ui = {
  file: $('#file-input'), fileName: $('#file-name'), canvas: $('#waveform'), seek: $('#waveform-hit-area'),
  play: $('#play'), stop: $('#stop'), volume: $('#volume'), current: $('#current-time'), duration: $('#duration'),
  sampleRate: $('#sample-rate'), channels: $('#channels'), diagDuration: $('#diag-duration'),
  octave: $('#target-octave'), strength: $('#strength'), strengthValue: $('#strength-value'), target: $('#target-readout')
};

let context;
let gain;
let buffer;
let source;
let startedAt = 0;
let pausedAt = 0;
let playing = false;
let animationFrame;

function ensureAudio() {
  context ??= new AudioContext();
  if (!gain) { gain = context.createGain(); gain.gain.value = Number(ui.volume.value); gain.connect(context.destination); }
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00.0';
  const mins = Math.floor(seconds / 60);
  return `${mins}:${(seconds % 60).toFixed(1).padStart(4, '0')}`;
}

function drawWaveform(progress = 0) {
  const canvas = ui.canvas;
  const ratio = devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width * ratio || canvas.height !== height * ratio) { canvas.width = width * ratio; canvas.height = height * ratio; }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#080c11'; ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#1d2b37'; ctx.beginPath(); ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); ctx.stroke();
  if (!buffer) { ctx.fillStyle='#607067'; ctx.textAlign='center'; ctx.fillText('IMPORT AUDIO TO BEGIN',width/2,height/2-12); return; }
  const data = buffer.getChannelData(0);
  const columns = Math.max(1, Math.floor(width));
  const step = Math.max(1, Math.floor(data.length / columns));
  for (let x = 0; x < columns; x++) {
    let min = 1, max = -1;
    const start = x * step;
    for (let i = 0; i < step && start + i < data.length; i++) { const v=data[start+i]; if(v<min)min=v; if(v>max)max=v; }
    ctx.strokeStyle = x / columns <= progress ? '#62f28c' : '#496254';
    ctx.beginPath(); ctx.moveTo(x,(1+min)*height/2); ctx.lineTo(x,(1+max)*height/2); ctx.stroke();
  }
  ctx.fillStyle='#ffc857'; ctx.fillRect(Math.min(progress,1)*width-1,0,2,height);
}

function stopSource() {
  if (source) { source.onended = null; try { source.stop(); } catch {} source.disconnect(); source = null; }
  cancelAnimationFrame(animationFrame); playing = false; ui.play.textContent = 'Play';
}

async function play() {
  if (!buffer) return;
  ensureAudio(); await context.resume(); stopSource();
  source = context.createBufferSource(); source.buffer = buffer; source.connect(gain);
  startedAt = context.currentTime - pausedAt; source.start(0, pausedAt);
  source.onended = () => { if (playing) { pausedAt=0; stopSource(); updatePosition(); } };
  playing = true; ui.play.textContent='Pause'; tick();
}

function pause() { pausedAt = Math.min(buffer.duration, context.currentTime - startedAt); stopSource(); updatePosition(); }
function reset() { stopSource(); pausedAt=0; updatePosition(); }
function updatePosition() {
  const position = playing ? Math.min(buffer.duration, context.currentTime-startedAt) : pausedAt;
  ui.current.textContent=formatTime(position); drawWaveform(buffer ? position/buffer.duration : 0);
}
function tick() { updatePosition(); if (playing) animationFrame=requestAnimationFrame(tick); }

ui.file.addEventListener('change', async () => {
  const file=ui.file.files[0]; if(!file)return;
  ensureAudio(); reset(); ui.fileName.textContent=`Decoding ${file.name}…`;
  try {
    buffer=await context.decodeAudioData(await file.arrayBuffer());
    ui.fileName.textContent=file.name; ui.duration.textContent=formatTime(buffer.duration); ui.diagDuration.textContent=formatTime(buffer.duration);
    ui.sampleRate.textContent=`${buffer.sampleRate.toLocaleString()} Hz`; ui.channels.textContent=String(buffer.numberOfChannels);
    ui.play.disabled=false; ui.stop.disabled=false; drawWaveform();
  } catch (error) { buffer=null; ui.fileName.textContent=`Could not decode ${file.name}: ${error.message}`; drawWaveform(); }
});
ui.play.addEventListener('click', () => playing ? pause() : play());
ui.stop.addEventListener('click', reset);
ui.volume.addEventListener('input', () => { ensureAudio(); gain.gain.setTargetAtTime(Number(ui.volume.value),context.currentTime,.01); });
ui.seek.addEventListener('click', (event) => { if(!buffer)return; const wasPlaying=playing; stopSource(); pausedAt=(event.offsetX/ui.seek.clientWidth)*buffer.duration; wasPlaying?play():updatePosition(); });
ui.strength.addEventListener('input', () => ui.strengthValue.textContent=`${ui.strength.value}%`);
ui.octave.addEventListener('change', () => { const midi=12*(Number(ui.octave.value)+1); const hz=440*2**((midi-69)/12); ui.target.textContent=`C${ui.octave.value} (${hz.toFixed(2)} Hz)`; });
addEventListener('resize', updatePosition);
drawWaveform();
