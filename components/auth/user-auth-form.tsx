"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { signIn } from "next-auth/react"

export function UserAuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit } = useForm()

  async function onSubmit(data: any) {
    setIsLoading(true)
    try {
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: "/"
      })
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <div className="grid gap-1">
          <input
            {...register("email")}
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-1">
          <input
            {...register("password")}
            placeholder="password"
            type="password"
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Sign In"}
        </button>
      </div>
    </form>
  )
}
