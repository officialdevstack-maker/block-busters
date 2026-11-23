"use client"

import * as React from "react"
import {
  Loader2,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react"

import { Button } from "@/components/ui/button"

type VideoPlayerProps = {
  id: string
  src: string
  poster: string
  title: string
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

const fmt = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00"
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0")
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs}`
    : `${minutes}:${secs}`
}

const iconButton =
  "size-9 rounded-full text-white hover:bg-white/15 hover:text-white"

export function VideoPlayer({ id, src, poster, title }: VideoPlayerProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const barRef = React.useRef<HTMLDivElement>(null)
  const hideTimer = React.useRef<number | undefined>(undefined)
  const clickTimer = React.useRef<number | undefined>(undefined)
  const dragging = React.useRef(false)
  const lastSaved = React.useRef(0)
  const progressKey = `progress:${id}`

  const [playing, setPlaying] = React.useState(false)
  const [started, setStarted] = React.useState(false)
  const [current, setCurrent] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [buffered, setBuffered] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [muted, setMuted] = React.useState(false)
  const [rate, setRate] = React.useState(1)
  const [buffering, setBuffering] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [fullscreen, setFullscreen] = React.useState(false)
  const [visible, setVisible] = React.useState(true)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [hover, setHover] = React.useState<{ x: number; t: number } | null>(null)
  const [flash, setFlash] = React.useState<{
    label: string
    side: "l" | "r"
    k: number
  } | null>(null)

  const showControls = React.useCallback(() => {
    setVisible(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setVisible(false)
        setMenuOpen(false)
      }
    }, 2800)
  }, [])

  React.useEffect(
    () => () => {
      window.clearTimeout(hideTimer.current)
      window.clearTimeout(clickTimer.current)
    },
    []
  )

  const togglePlay = React.useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play().catch(() => setError(true))
    else video.pause()
  }, [])

  const skip = React.useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(
      Math.max(video.currentTime + seconds, 0),
      video.duration || 0
    )
    setFlash({
      label: `${seconds > 0 ? "+" : ""}${seconds}s`,
      side: seconds > 0 ? "r" : "l",
      k: Date.now(),
    })
  }, [])

  const toggleMute = React.useCallback(() => {
    const video = videoRef.current
    if (video) video.muted = !video.muted
  }, [])

  const changeVolume = React.useCallback((value: number) => {
    const video = videoRef.current
    if (!video) return
    video.volume = Math.min(Math.max(value, 0), 1)
    video.muted = video.volume === 0
    try {
      localStorage.setItem("player:volume", String(video.volume))
    } catch {}
  }, [])

  const toggleFullscreen = React.useCallback(() => {
    const wrap = wrapRef.current
    const video = videoRef.current as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null
    if (!wrap || !video) return
    if (document.fullscreenElement) document.exitFullscreen()
    else if (wrap.requestFullscreen) wrap.requestFullscreen()
    else video.webkitEnterFullscreen?.()
  }, [])

  const togglePip = async () => {
    const video = videoRef.current
    if (!video || !document.pictureInPictureEnabled) return
    if (document.pictureInPictureElement) await document.exitPictureInPicture()
    else await video.requestPictureInPicture()
  }

  const setSpeed = (rate: number) => {
    if (videoRef.current) videoRef.current.playbackRate = rate
    setMenuOpen(false)
  }

  const retry = () => {
    setError(false)
    videoRef.current?.load()
  }

  React.useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("player:volume")
      if (saved && videoRef.current) {
        videoRef.current.volume = Number(saved)
      }
    } catch {}
  }, [])

  const saveProgress = (time: number) => {
    try {
      localStorage.setItem(progressKey, String(time))
    } catch {}
  }

  const onLoadedMetadata = () => {
    const video = videoRef.current
    if (!video) return
    setDuration(video.duration)
    try {
      const saved = Number(localStorage.getItem(progressKey))
      if (saved > 5 && saved < video.duration - 10) {
        video.currentTime = saved
      }
    } catch {}
  }

  const onTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    setCurrent(video.currentTime)
    if (Math.abs(video.currentTime - lastSaved.current) >= 5) {
      lastSaved.current = video.currentTime
      saveProgress(video.currentTime)
    }
  }

  const onProgress = () => {
    const video = videoRef.current
    if (!video) return
    const { buffered: ranges, currentTime } = video
    for (let index = 0; index < ranges.length; index++) {
      if (ranges.start(index) <= currentTime && ranges.end(index) >= currentTime) {
        setBuffered(ranges.end(index))
        break
      }
    }
  }

  const timeFromPointer = (clientX: number) => {
    const rect = barRef.current!.getBoundingClientRect()
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    return { ratio, t: ratio * duration, x: ratio * rect.width }
  }

  const onBarDown = (event: React.PointerEvent) => {
    dragging.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    const { t } = timeFromPointer(event.clientX)
    if (videoRef.current) videoRef.current.currentTime = t
    setCurrent(t)
  }

  const onBarMove = (event: React.PointerEvent) => {
    const { t, x } = timeFromPointer(event.clientX)
    setHover({ x, t })
    if (dragging.current) {
      if (videoRef.current) videoRef.current.currentTime = t
      setCurrent(t)
    }
  }

  const onBarUp = (event: React.PointerEvent) => {
    dragging.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const onSurfaceClick = (event: React.MouseEvent<HTMLDivElement>) => {
    wrapRef.current?.focus()
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current)
      clickTimer.current = undefined
      const rect = event.currentTarget.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      if (x < 0.33) skip(-10)
      else if (x > 0.67) skip(10)
      else toggleFullscreen()
    } else {
      clickTimer.current = window.setTimeout(() => {
        clickTimer.current = undefined
        togglePlay()
      }, 250)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const video = videoRef.current
    if (!video || event.metaKey || event.ctrlKey || event.altKey) return
    if (event.target instanceof HTMLInputElement) return
    const key = event.key.toLowerCase()
    if ((key === " " || key === "enter") && event.target instanceof HTMLButtonElement) return

    const handled = () => {
      event.preventDefault()
      showControls()
    }
    if (key === " " || key === "k") {
      handled()
      togglePlay()
    } else if (key === "j") {
      handled()
      skip(-10)
    } else if (key === "l") {
      handled()
      skip(10)
    } else if (key === "arrowleft") {
      handled()
      skip(-5)
    } else if (key === "arrowright") {
      handled()
      skip(5)
    } else if (key === "arrowup") {
      handled()
      changeVolume(video.volume + 0.1)
    } else if (key === "arrowdown") {
      handled()
      changeVolume(video.volume - 0.1)
    } else if (key === "m") {
      handled()
      toggleMute()
    } else if (key === "f") {
      handled()
      toggleFullscreen()
    } else if (/^[0-9]$/.test(key) && video.duration) {
      handled()
      video.currentTime = (Number(key) / 10) * video.duration
    }
  }

  const pct = (value: number) =>
    duration ? `${(value / duration) * 100}%` : "0%"
  const showUI = visible || !playing

  return (
    <div className="w-full bg-black">
      <div
        ref={wrapRef}
        aria-label={`${title} video player`}
        className={`group relative mx-auto w-full overflow-hidden bg-black outline-none select-none ${
          fullscreen
            ? "h-full"
            : "aspect-video max-h-[calc(100svh-5rem)]"
        } ${!showUI ? "cursor-none" : ""}`}
        onKeyDown={onKeyDown}
        onMouseLeave={() => playing && setVisible(false)}
        onMouseMove={showControls}
        onTouchStart={showControls}
        role="region"
        tabIndex={0}
      >
        <video
          ref={videoRef}
          className="size-full object-contain"
          onCanPlay={() => setBuffering(false)}
          onDurationChange={(event) => setDuration(event.currentTarget.duration)}
          onEnded={() => {
            setPlaying(false)
            saveProgress(0)
          }}
          onError={() => setError(true)}
          onLoadedMetadata={onLoadedMetadata}
          onPause={() => {
            setPlaying(false)
            setVisible(true)
            saveProgress(videoRef.current?.currentTime ?? 0)
          }}
          onPlay={() => {
            setPlaying(true)
            setStarted(true)
            setError(false)
            showControls()
          }}
          onPlaying={() => setBuffering(false)}
          onProgress={onProgress}
          onRateChange={(event) => setRate(event.currentTarget.playbackRate)}
          onTimeUpdate={onTimeUpdate}
          onVolumeChange={(event) => {
            setVolume(event.currentTarget.volume)
            setMuted(event.currentTarget.muted)
          }}
          onWaiting={() => setBuffering(true)}
          playsInline
          poster={poster}
          preload="metadata"
          src={src}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0"
          onClick={onSurfaceClick}
        />

        {flash && (
          <div
            key={flash.k}
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 animate-out fade-out duration-700 fill-mode-forwards ${
              flash.side === "l" ? "left-[12%]" : "right-[12%]"
            }`}
          >
            <span className="rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white">
              {flash.label}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {error ? (
            <div className="pointer-events-auto space-y-3 rounded-2xl bg-black/70 px-6 py-5 text-center text-white">
              <p className="text-sm font-medium">This video couldn&apos;t be played.</p>
              <Button
                className="rounded-full"
                onClick={retry}
                size="sm"
                variant="secondary"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Try again
              </Button>
            </div>
          ) : buffering && playing ? (
            <Loader2
              aria-label="Buffering"
              className="size-12 animate-spin text-white/90"
            />
          ) : !playing ? (
            <button
              aria-label={started ? "Resume" : "Play"}
              className="pointer-events-auto flex size-20 items-center justify-center rounded-full bg-brand text-black shadow-2xl transition-transform hover:scale-105"
              onClick={togglePlay}
              type="button"
            >
              <Play
                aria-hidden="true"
                className="size-9 translate-x-0.5 fill-current"
              />
            </button>
          ) : null}
        </div>

        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2 pt-12 text-white transition-opacity duration-300 sm:px-4 ${
            showUI
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <div
            ref={barRef}
            aria-label="Seek"
            aria-valuemax={Math.floor(duration)}
            aria-valuemin={0}
            aria-valuenow={Math.floor(current)}
            aria-valuetext={`${fmt(current)} of ${fmt(duration)}`}
            className="group/bar relative flex h-5 cursor-pointer touch-none items-center"
            onPointerDown={onBarDown}
            onPointerLeave={() => setHover(null)}
            onPointerMove={onBarMove}
            onPointerUp={onBarUp}
            role="slider"
            tabIndex={0}
          >
            <div className="relative h-1 w-full rounded-full bg-white/25 transition-[height] group-hover/bar:h-1.5">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white/35"
                style={{ width: pct(buffered) }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-brand"
                style={{ width: pct(current) }}
              />
              <div
                className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-brand transition-transform group-hover/bar:scale-100"
                style={{ left: pct(current) }}
              />
            </div>
            {hover && (
              <span
                className="pointer-events-none absolute -top-6 -translate-x-1/2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium"
                style={{ left: hover.x }}
              >
                {fmt(hover.t)}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1">
            <Button
              aria-label={playing ? "Pause" : "Play"}
              className={iconButton}
              onClick={togglePlay}
              size="icon"
              variant="ghost"
            >
              {playing ? (
                <Pause aria-hidden="true" className="size-5 fill-current" />
              ) : (
                <Play aria-hidden="true" className="size-5 fill-current" />
              )}
            </Button>
            <Button
              aria-label="Back 10 seconds"
              className={`${iconButton} hidden sm:inline-flex`}
              onClick={() => skip(-10)}
              size="icon"
              variant="ghost"
            >
              <RotateCcw aria-hidden="true" className="size-4.5" />
            </Button>
            <Button
              aria-label="Forward 10 seconds"
              className={`${iconButton} hidden sm:inline-flex`}
              onClick={() => skip(10)}
              size="icon"
              variant="ghost"
            >
              <RotateCw aria-hidden="true" className="size-4.5" />
            </Button>

            <div className="group/vol flex items-center">
              <Button
                aria-label={muted ? "Unmute" : "Mute"}
                className={iconButton}
                onClick={toggleMute}
                size="icon"
                variant="ghost"
              >
                {muted || volume === 0 ? (
                  <VolumeX aria-hidden="true" className="size-5" />
                ) : (
                  <Volume2 aria-hidden="true" className="size-5" />
                )}
              </Button>
              <input
                aria-label="Volume"
                className="hidden w-0 accent-brand opacity-0 transition-all group-hover/vol:w-20 group-hover/vol:opacity-100 group-focus-within/vol:w-20 group-focus-within/vol:opacity-100 sm:block"
                max={1}
                min={0}
                onChange={(event) => changeVolume(Number(event.target.value))}
                step={0.05}
                type="range"
                value={muted ? 0 : volume}
              />
            </div>

            <span className="ml-2 text-xs tabular-nums text-white/85">
              {fmt(current)} / {fmt(duration)}
            </span>

            <div className="ml-auto flex items-center gap-1">
              <div className="relative">
                <Button
                  aria-expanded={menuOpen}
                  aria-label="Playback speed"
                  className={`${iconButton} w-auto gap-1 px-2.5 text-xs font-semibold`}
                  onClick={() => setMenuOpen((open) => !open)}
                  size="icon"
                  variant="ghost"
                >
                  {rate === 1 ? (
                    <Settings aria-hidden="true" className="size-5" />
                  ) : (
                    `${rate}×`
                  )}
                </Button>
                {menuOpen && (
                  <ul className="absolute bottom-11 right-0 min-w-28 rounded-xl border border-white/10 bg-zinc-900/95 p-1.5 text-sm shadow-xl backdrop-blur">
                    <li className="px-2.5 pb-1 pt-0.5 text-[11px] uppercase tracking-wider text-white/50">
                      Speed
                    </li>
                    {SPEEDS.map((speed) => (
                      <li key={speed}>
                        <button
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left hover:bg-white/10 ${
                            speed === rate ? "text-brand" : ""
                          }`}
                          onClick={() => setSpeed(speed)}
                          type="button"
                        >
                          {speed === 1 ? "Normal" : `${speed}×`}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button
                aria-label="Picture in picture"
                className={`${iconButton} hidden sm:inline-flex`}
                onClick={togglePip}
                size="icon"
                variant="ghost"
              >
                <PictureInPicture2 aria-hidden="true" className="size-5" />
              </Button>
              <Button
                aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                className={iconButton}
                onClick={toggleFullscreen}
                size="icon"
                variant="ghost"
              >
                {fullscreen ? (
                  <Minimize aria-hidden="true" className="size-5" />
                ) : (
                  <Maximize aria-hidden="true" className="size-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
