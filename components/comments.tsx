"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { SpursSignInButton } from "@spurs/auth/react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export type Comment = {
  id: string
  author: string
  body: string
  time: string
  likes: number
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

export function Comments({
  initial,
  authenticated,
  userName,
}: {
  initial: Comment[]
  authenticated: boolean
  userName: string
}) {
  const [comments, setComments] = React.useState(initial)
  const [draft, setDraft] = React.useState("")
  const [liked, setLiked] = React.useState<Set<string>>(new Set())

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body) return
    setComments((current) => [
      { id: crypto.randomUUID(), author: userName, body, time: "Just now", likes: 0 },
      ...current,
    ])
    setDraft("")
  }

  const toggleLike = (id: string) =>
    setLiked((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <section aria-label="Comments" className="space-y-6">
      <h2 className="text-lg font-semibold">{comments.length} comments</h2>

      {authenticated ? (
        <form className="flex gap-3" onSubmit={submit}>
          <Avatar>
            <AvatarFallback>{initials(userName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              aria-label="Add a comment"
              maxLength={500}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a comment..."
              rows={2}
              value={draft}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{draft.length}/500</span>
              <Button disabled={!draft.trim()} size="sm" type="submit">
                Comment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Sign in to comment or like a title.</p>
          <SpursSignInButton accent="#eab308" style={{ color: "#111827" }}>
            Sign in with Spurs
          </SpursSignInButton>
        </div>
      )}

      <ul className="space-y-5">
        {comments.map((comment) => {
          const isLiked = liked.has(comment.id)
          return (
            <li className="flex gap-3" key={comment.id}>
              <Avatar>
                <AvatarFallback>{initials(comment.author)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{comment.author}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{comment.time}</span>
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm">{comment.body}</p>
                {authenticated ? (
                  <button
                    aria-pressed={isLiked}
                    className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground aria-pressed:text-brand"
                    onClick={() => toggleLike(comment.id)}
                    type="button"
                  >
                    <Heart aria-hidden="true" className={`size-3.5 ${isLiked ? "fill-current" : ""}`} />
                    {comment.likes + (isLiked ? 1 : 0)}
                  </button>
                ) : (
                  <span className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Heart aria-hidden="true" className="size-3.5" />
                    {comment.likes}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
