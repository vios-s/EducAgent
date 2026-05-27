import { execFileSync, spawnSync } from 'child_process';
import { copyFileSync, existsSync, linkSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { basename, dirname, join, resolve } from 'path';
import { tmpdir, homedir, platform } from 'os';
import vm from 'vm';

const ROOT = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const CONTENT_PATH = join(ROOT, 'docs', 'content.jsx');
const OUT_DIR = join(ROOT, 'docs', 'assets', 'audio', 'learner_0', 'interventions');
const MANIFEST_PATH = join(OUT_DIR, 'manifest.json');
const TEXT_TMP_DIR = join(tmpdir(), 'educagent-learner0-tts-text');
const WAV_TMP_DIR = join(tmpdir(), 'educagent-learner0-tts-wav');

const VOICE = 'bf_emma';
const SPEED = '0.92';
const WHISPER_MODEL = 'tiny.en';

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(TEXT_TMP_DIR, { recursive: true });
  mkdirSync(WAV_TMP_DIR, { recursive: true });

  const lessons = loadLearner0Lessons();
  const segments = extractSegments(lessons);
  const previousManifest = readExistingManifest();
  const env = buildToolEnv();
  const manifest = {
    version: 1,
    course: 'learner_0/passive_courses/interventions',
    voice: VOICE,
    speed: Number(SPEED),
    whisperModel: WHISPER_MODEL,
    segmentCount: segments.length,
    segments: {},
  };

  for (const [index, segment] of segments.entries()) {
    const audioFile = `${segment.id}.mp3`;
    const transcriptFile = `${segment.id}.json`;
    const audioPath = join(OUT_DIR, audioFile);
    const transcriptPath = join(OUT_DIR, transcriptFile);
    const previousSegment = previousManifest?.segments?.[segment.id];
    const segmentChanged = previousSegment && (
      previousSegment.text !== segment.originalText ||
      previousSegment.speechText !== segment.speechText
    );

    console.log(`[${index + 1}/${segments.length}] ${segment.id}`);
    if (segmentChanged) {
      console.log('  text changed; regenerating audio and transcript');
      rmSync(audioPath, { force: true });
      rmSync(transcriptPath, { force: true });
    }

    if (!existsSync(audioPath)) {
      const textPath = join(TEXT_TMP_DIR, `${segment.id}.txt`);
      const wavPath = join(WAV_TMP_DIR, `${segment.id}.wav`);
      writeFileSync(textPath, segment.speechText, 'utf8');
      run('npx', ['hyperframes', 'tts', textPath, '--voice', VOICE, '--speed', SPEED, '--output', wavPath, '--json'], { env });
      run('ffmpeg', ['-y', '-i', wavPath, '-codec:a', 'libmp3lame', '-q:a', '4', audioPath], { quiet: true });
      rmSync(wavPath, { force: true });
    }

    if (!existsSync(transcriptPath)) {
      const transcriptDir = join(WAV_TMP_DIR, `${segment.id}-transcript`);
      rmSync(transcriptDir, { recursive: true, force: true });
      mkdirSync(transcriptDir, { recursive: true });
      run('npx', ['hyperframes', 'transcribe', audioPath, '--model', WHISPER_MODEL, '--dir', transcriptDir, '--json'], { env });
      const produced = join(transcriptDir, 'transcript.json');
      if (!existsSync(produced)) throw new Error(`Missing transcript for ${segment.id}`);
      const raw = JSON.parse(readFileSync(produced, 'utf8'));
      writeFileSync(transcriptPath, JSON.stringify(raw, null, 2), 'utf8');
      rmSync(transcriptDir, { recursive: true, force: true });
    }

    const durationSeconds = getDurationSeconds(audioPath);
    manifest.segments[segment.id] = {
      id: segment.id,
      lessonId: segment.lessonId,
      blockIndex: segment.blockIndex,
      part: segment.part,
      kind: segment.kind,
      text: segment.originalText,
      speechText: segment.speechText,
      audioSrc: `assets/audio/learner_0/interventions/${audioFile}`,
      transcriptSrc: `assets/audio/learner_0/interventions/${transcriptFile}`,
      durationSeconds,
    };
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Wrote ${segments.length} segments to ${OUT_DIR}`);
}

function readExistingManifest() {
  if (!existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function loadLearner0Lessons() {
  const code = readFileSync(CONTENT_PATH, 'utf8');
  const sandbox = { window: {}, console };
  vm.runInNewContext(code, sandbox, { filename: CONTENT_PATH });
  return sandbox.window.LEARNER0_LESSONS;
}

function extractSegments(lessons) {
  const segments = [];
  const add = (lesson, blockIndex, part, kind, text) => {
    const speechText = toSpeechText(text);
    if (!speechText) return;
    segments.push({
      id: makeAudioId(lesson.id, blockIndex, part),
      lessonId: lesson.id,
      blockIndex,
      part,
      kind,
      originalText: text,
      speechText,
    });
  };

  for (const lesson of lessons) {
    lesson.blocks.forEach((block, blockIndex) => {
      if (block.kind === 'objectives') {
        block.items.forEach((text, itemIndex) => add(lesson, blockIndex, `objective-${itemIndex}`, 'objective', text));
      } else if (block.kind === 'p') {
        add(lesson, blockIndex, 'p', 'paragraph', block.text);
      } else if (block.kind === 'figure' && block.caption) {
        add(lesson, blockIndex, 'caption', 'caption', block.caption);
      } else if (block.kind === 'callout') {
        add(lesson, blockIndex, 'callout', 'callout', block.text);
      } else if (block.kind === 'cards') {
        block.items.forEach((item, itemIndex) => add(lesson, blockIndex, `card-${itemIndex}`, 'card', `${item.label}. ${item.desc}`));
      } else if (block.kind === 'roads') {
        block.roads.forEach((road, roadIndex) => {
          add(lesson, blockIndex, `road-${roadIndex}`, 'road', `${road.label}. ${road.desc}`);
          if (road.note) add(lesson, blockIndex, `road-${roadIndex}-note`, 'road-note', road.note);
        });
      }
    });
  }

  return segments;
}

function makeAudioId(lessonId, blockIndex, part) {
  return `${lessonId}--b${String(blockIndex).padStart(2, '0')}--${part}`;
}

function toSpeechText(value) {
  return String(value || '')
    .replace(/___([^_]+)___/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/do\(([^)]+)\)/g, 'do intervention: $1')
    .replace(/:=/g, ' is set to ')
    .replace(/->/g, ' to ')
    .replace(/PriorAchievement/g, 'Prior Achievement')
    .replace(/TutoringAssignment/g, 'Tutoring Assignment')
    .replace(/TestScore/g, 'Test Score')
    .replace(/\bT\b/g, 'T')
    .replace(/\bZ\b/g, 'Z')
    .replace(/\bY\b/g, 'Y')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildToolEnv() {
  const env = { ...process.env };
  const pathKey = Object.keys(env).find((key) => key.toLowerCase() === 'path') || 'PATH';
  if (platform() === 'win32') {
    const shimDir = join(tmpdir(), 'educagent-python-shim');
    mkdirSync(shimDir, { recursive: true });
    const python = resolve(homedir(), 'miniconda3', 'python.exe');
    if (existsSync(python)) {
      rmSync(join(shimDir, 'python3.cmd'), { force: true });
      const pythonShim = join(shimDir, 'python3.exe');
      if (!existsSync(pythonShim)) {
        try {
          linkSync(python, pythonShim);
        } catch {
          copyFileSync(python, pythonShim);
        }
      }
      env[pathKey] = `${shimDir};${env[pathKey]}`;
    }

    const msysBin = 'C:\\dev\\msys64\\ucrt64\\bin';
    const condaScripts = resolve(homedir(), 'miniconda3', 'Scripts');
    env[pathKey] = `${shimDir};${msysBin};${condaScripts};${env[pathKey]}`;
    env.CMAKE_GENERATOR = env.CMAKE_GENERATOR || 'MinGW Makefiles';

    const whisperExe = resolve(homedir(), '.cache', 'hyperframes', 'whisper', 'whisper.cpp', 'build', 'bin', 'whisper-cli.exe');
    if (existsSync(whisperExe)) env.HYPERFRAMES_WHISPER_PATH = whisperExe;
  }
  return env;
}

function run(command, args, options = {}) {
  const spawnOptions = {
    cwd: ROOT,
    env: options.env || process.env,
    encoding: 'utf8',
    stdio: options.quiet ? 'ignore' : 'pipe',
  };
  const result = platform() === 'win32'
    ? spawnSync([command, ...args].map(cmdQuote).join(' '), { ...spawnOptions, shell: true })
    : spawnSync(command, args, { ...spawnOptions, shell: false });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`${command} ${args.join(' ')} failed${details ? `\n${details}` : ''}`);
  }
  if (!options.quiet && result.stdout) process.stdout.write(result.stdout);
}

function cmdQuote(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=\\-]+$/.test(text)) return text;
  return `"${text.replace(/"/g, '\\"')}"`;
}

function getDurationSeconds(audioPath) {
  try {
    const output = execFileSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      audioPath,
    ], { encoding: 'utf8' }).trim();
    const value = Number(output);
    return Number.isFinite(value) ? Math.round(value * 1000) / 1000 : null;
  } catch {
    return null;
  }
}

main();
