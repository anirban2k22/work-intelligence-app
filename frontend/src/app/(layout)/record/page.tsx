"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import {
  Mic,
  Square,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Save,
  X,
  Clock,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Status =
  | "idle"
  | "recording"
  | "transcribing"
  | "editing"
  | "saving"
  | "success"
  | "error";

const BACKEND = "http://localhost:8000";

export default function RecordPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [editedTranscript, setEditedTranscript] = useState("");
  const [successCount, setSuccessCount] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingStartedAt, setRecordingStartedAt] = useState<Date | null>(null);

  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Recording timer
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => {
        setRecordingDuration((d) => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const reset = () => {
    setStatus("idle");
    setErrorMsg(null);
    setTranscript("");
    setEditedTranscript("");
    setSuccessCount(0);
    setRecordingDuration(0);
    setRecordingStartedAt(null);
  };

  const startRecording = async () => {
    try {
      reset();

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("error");
        setErrorMsg("You must be logged in. Please sign in first.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(blob);
      };

      mediaRecorder.start(250);
      setRecordingStartedAt(new Date());
      setRecordingDuration(0);
      setStatus("recording");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg("Microphone access was denied. Please allow microphone access and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
      setStatus("transcribing");
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus("error");
        setErrorMsg("Session expired. Please log out and log back in.");
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, "recording.webm");

      const response = await fetch(`${BACKEND}/api/v1/transcribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Transcription failed. Try again.");
      }

      const data = await response.json();
      const rawTranscript = data.transcript || "";

      if (!rawTranscript.trim()) {
        throw new Error("No speech detected. Please try speaking more clearly.");
      }

      setTranscript(rawTranscript);
      setEditedTranscript(rawTranscript);
      setStatus("editing");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "An error occurred. Check that the backend server is running on port 8000.");
    }
  };

  const saveTranscript = async () => {
    if (!editedTranscript.trim()) return;

    try {
      setStatus("saving");

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus("error");
        setErrorMsg("Session expired. Please log out and log back in.");
        return;
      }

      const response = await fetch(`${BACKEND}/api/v1/capture/text`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: editedTranscript }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to save. Please try again.");
      }

      const data = await response.json();
      setSuccessCount(data.entries_count || 0);
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Save failed. Check that the backend is running.");
    }
  };

  const goToDashboard = () => {
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full gap-6">
      <PageHeader
        title="Record Work"
        description="Describe your work naturally. The AI will structure it for you."
      />

      {/* Error Banner */}
      {status === "error" && errorMsg && (
        <div className="w-full p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium flex items-start gap-3">
          <X className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="border-2 border-dashed border-gray-200 bg-white rounded-xl p-8 flex flex-col items-center gap-6">

        {/* ── IDLE ── */}
        {status === "idle" && (
          <>
            <div className="w-28 h-28 rounded-full flex items-center justify-center border-4 border-gray-200 bg-gray-50">
              <Mic className="w-12 h-12 text-gray-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#1a1a1a]">Ready to capture</h3>
              <p className="text-sm text-gray-500 mt-1">Click start to begin voice dictation.</p>
            </div>
            <Button
              onClick={startRecording}
              className="px-8 py-6 text-base font-bold bg-[#1a1a1a] hover:bg-black text-white"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          </>
        )}

        {/* ── RECORDING ── */}
        {status === "recording" && (
          <>
            <div className="relative">
              <div className="w-28 h-28 rounded-full flex items-center justify-center border-4 border-red-500 bg-red-50 animate-pulse">
                <Mic className="w-12 h-12 text-red-500" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-mono px-2 py-0.5 rounded-full">
                {formatDuration(recordingDuration)}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#1a1a1a]">Recording in progress...</h3>
              <p className="text-sm text-gray-500 mt-1">Speak naturally about what you worked on today.</p>
            </div>
            <Button
              onClick={stopRecording}
              className="px-8 py-6 text-base font-bold bg-red-500 hover:bg-red-600 text-white"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop &amp; Transcribe
            </Button>
          </>
        )}

        {/* ── TRANSCRIBING ── */}
        {status === "transcribing" && (
          <>
            <div className="w-28 h-28 rounded-full flex items-center justify-center border-4 border-blue-400 bg-blue-50">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#1a1a1a]">Transcribing...</h3>
              <p className="text-sm text-gray-500 mt-1">Converting your speech to text with Whisper AI.</p>
            </div>
          </>
        )}

        {/* ── EDITING ── */}
        {status === "editing" && (
          <div className="w-full flex flex-col gap-4">
            {/* Metadata row */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {recordingStartedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recorded at {recordingStartedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Duration: {formatDuration(recordingDuration)}
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <Pencil className="w-3 h-3" />
                Edit before saving
              </span>
            </div>

            {/* Editable textarea */}
            <textarea
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              className="w-full min-h-[200px] p-4 text-sm leading-relaxed border border-gray-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent bg-gray-50 text-[#1a1a1a]"
              placeholder="Your transcription will appear here..."
              autoFocus
            />

            <p className="text-xs text-gray-400">
              The AI will extract individual work tasks from this text and map them to your KRAs.
            </p>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={saveTranscript}
                disabled={!editedTranscript.trim()}
                className="px-6 py-5 font-bold bg-[#1a1a1a] hover:bg-black text-white flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save &amp; Extract Tasks
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="px-6 py-5 font-bold border-2"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Re-record
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="ghost"
                className="px-4 py-5 text-gray-500"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* ── SAVING ── */}
        {status === "saving" && (
          <>
            <div className="w-28 h-28 rounded-full flex items-center justify-center border-4 border-blue-400 bg-blue-50">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#1a1a1a]">Extracting tasks...</h3>
              <p className="text-sm text-gray-500 mt-1">AI is mapping your work to KRAs and saving to your log.</p>
            </div>
          </>
        )}

        {/* ── SUCCESS ── */}
        {status === "success" && (
          <>
            <div className="w-28 h-28 rounded-full flex items-center justify-center border-4 border-green-500 bg-green-50">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#1a1a1a]">
                {successCount} task{successCount !== 1 ? "s" : ""} saved!
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Your work log has been updated and mapped to your KRAs.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={goToDashboard}
                className="px-8 py-5 font-bold bg-green-600 hover:bg-green-700 text-white"
              >
                View Dashboard
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="px-8 py-5 font-bold border-2 border-[#1a1a1a]"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Record Another
              </Button>
            </div>
          </>
        )}

        {/* ── ERROR retry ── */}
        {status === "error" && (
          <Button
            onClick={reset}
            variant="outline"
            className="px-8 py-5 font-bold border-2 border-gray-400"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
