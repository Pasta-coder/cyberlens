"use client";

import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, Pause } from "lucide-react";

interface FloatingAudioButtonProps {
  src: string;
  label: string;
  position: "left" | "right";
}

export default function FloatingAudioButton({
  src,
  label,
  position,
}: FloatingAudioButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    
    const audio = audioRef.current;

    // Event handlers
    const handleLoadedData = () => {
      console.log(`✅ Audio loaded successfully: ${src}`);
      setIsLoaded(true);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error(`❌ Failed to load audio: ${src}`, e);
      setIsLoaded(false);
    };
    const handleCanPlay = () => {
      console.log(`🎵 Audio ready to play: ${src}`);
      setIsLoaded(true);
    };

    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Set source and load
    audio.src = src;
    audio.preload = "auto";
    audio.load();

    // Cleanup
    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, [src]);

  const toggleAudio = () => {
    if (!audioRef.current || !isLoaded) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Reset to beginning if ended
      if (audioRef.current.ended) {
        audioRef.current.currentTime = 0;
      }
      audioRef.current.play().catch((error) => {
        console.error("Audio play failed:", error);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const positionClasses =
    position === "left"
      ? "bottom-6 left-6"
      : "bottom-6 right-6";

  return (
    <button
      onClick={toggleAudio}
      disabled={!isLoaded}
      className={`fixed ${positionClasses} z-50 group`}
      aria-label={`${label} Audio Instructions`}
      title={`${label} Audio Instructions`}
    >
      <div
        className={`
          flex items-center gap-3 px-5 py-3 rounded-full
          bg-gradient-to-r from-purple-500 to-indigo-600
          hover:from-purple-400 hover:to-indigo-500
          text-white font-semibold shadow-2xl
          transition-all duration-300
          ${isPlaying ? "animate-pulse" : ""}
          ${!isLoaded ? "opacity-50 cursor-not-allowed" : "hover:shadow-purple-500/50 hover:scale-105"}
        `}
      >
        {/* Icon */}
        <div className="relative">
          {!isLoaded ? (
            <VolumeX className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
          
          {/* Audio wave animation when playing */}
          {isPlaying && (
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          )}
        </div>

        {/* Label */}
        <span className="text-sm font-bold">
          {isPlaying ? `⏸ ${label}` : `▶ ${label}`}
        </span>
      </div>
    </button>
  );
}
