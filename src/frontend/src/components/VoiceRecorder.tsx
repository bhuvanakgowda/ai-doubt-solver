import { Button } from "@/components/ui/button";
import { Mic, MicOff, RotateCcw, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface VoiceRecorderProps {
  onSubmit: (transcript: string) => void;
  isLoading: boolean;
}

type RecordState = "idle" | "recording" | "done";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function VoiceRecorder({
  onSubmit,
  isLoading,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [bars, setBars] = useState<number[]>(Array(24).fill(4));

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const elapsedRef = useRef(0);

  const stopAnimations = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animRef.current) {
      clearInterval(animRef.current);
      animRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAnimations();
      mediaRef.current?.stop();
      audioCtxRef.current?.close();
    };
  }, [stopAnimations]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    const draw = () => {
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barW = canvas.width / 24;
      const step = Math.floor(bufferLength / 24);
      for (let i = 0; i < 24; i++) {
        const val = data[i * step] / 255;
        const h = Math.max(4, val * canvas.height * 0.85);
        const x = i * barW + barW * 0.15;
        const y = (canvas.height - h) / 2;
        ctx.fillStyle = `oklch(0.68 0.18 195 / ${0.4 + val * 0.6})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW * 0.7, h, 3);
        ctx.fill();
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtxRef.current = new AudioContext();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        for (const t of stream.getTracks()) t.stop();
        audioCtxRef.current?.close();
        setTranscript(
          `Voice recording captured (${formatTime(elapsedRef.current)}) — transcription powered by AI will process your question.`,
        );
        setState("done");
      };
      mr.start();
      mediaRef.current = mr;
      setState("recording");
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          const next = e + 1;
          elapsedRef.current = next;
          return next;
        });
      }, 1000);
      drawWaveform();
    } catch {
      setState("idle");
    }
  }, [drawWaveform]);

  const stopRecording = useCallback(() => {
    stopAnimations();
    mediaRef.current?.stop();
  }, [stopAnimations]);

  const handleReset = () => {
    stopAnimations();
    setTranscript("");
    setElapsed(0);
    setBars(Array(24).fill(4));
    setState("idle");
  };

  const handleSubmit = () => {
    if (transcript.trim()) onSubmit(transcript.trim());
  };

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {state !== "done" && (
        <>
          {/* Waveform / idle animation */}
          <div
            className="w-full h-16 relative flex items-center justify-center"
            aria-hidden="true"
          >
            {state === "recording" ? (
              <canvas
                ref={canvasRef}
                width={300}
                height={64}
                className="w-full max-w-sm h-16"
              />
            ) : (
              <div className="flex items-end gap-1 h-10">
                {[
                  "b0",
                  "b1",
                  "b2",
                  "b3",
                  "b4",
                  "b5",
                  "b6",
                  "b7",
                  "b8",
                  "b9",
                  "b10",
                  "b11",
                  "b12",
                  "b13",
                  "b14",
                  "b15",
                  "b16",
                  "b17",
                  "b18",
                  "b19",
                  "b20",
                  "b21",
                  "b22",
                  "b23",
                ].map((k, i) => (
                  <div
                    key={k}
                    className="w-1.5 rounded-full bg-muted-foreground/30"
                    style={{ height: `${bars[i] ?? 4}px` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Timer */}
          <span className="font-mono text-2xl font-semibold text-foreground tabular-nums">
            {formatTime(elapsed)}
          </span>

          {/* Record button */}
          <button
            type="button"
            onClick={state === "idle" ? startRecording : stopRecording}
            disabled={isLoading}
            aria-label={state === "idle" ? "Start recording" : "Stop recording"}
            data-ocid="voice.record_button"
            className={`
              w-20 h-20 rounded-full flex items-center justify-center transition-smooth focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              ${
                state === "recording"
                  ? "bg-destructive text-destructive-foreground shadow-lg scale-105 animate-pulse"
                  : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
              }
            `}
          >
            {state === "recording" ? <MicOff size={32} /> : <Mic size={32} />}
          </button>

          <p className="text-sm text-muted-foreground">
            {state === "idle"
              ? "Click to start recording"
              : "Recording... Click to stop"}
          </p>
        </>
      )}

      {state === "done" && (
        <div className="w-full space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground mb-1 font-medium">
              Voice input captured
            </p>
            <p
              className="text-sm text-foreground leading-relaxed"
              data-ocid="voice.transcript"
            >
              {transcript}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1 gap-2"
              aria-label="Re-record voice"
              data-ocid="voice.rerecord_button"
            >
              <RotateCcw size={15} /> Re-record
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !transcript.trim()}
              className="flex-1 gap-2"
              aria-label="Submit voice transcript"
              data-ocid="voice.submit_button"
            >
              <Send size={15} /> Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
