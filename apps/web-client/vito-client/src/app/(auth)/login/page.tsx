"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email là bắt buộc" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), { message: "Email không hợp lệ" }),
  password: z
    .string()
    .min(1, { message: "Mật khẩu là bắt buộc" }),
})

export type LoginFormValues = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email") ?? ""
  const { toast } = useToast()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailFromQuery,
      password: "",
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string }
          | null
        const message = data?.message?.trim()
        toast({
          variant: "destructive",
          title: "Thất bại",
          description: message?.length ? message : "Đăng nhập thất bại",
        })
        return
      }

      toast({ title: "Thành công", description: "Đăng nhập thành công" })
      router.push("/account/orders")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Thất bại",
        description: "Không thể kết nối tới máy chủ",
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Email</Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="password">Mật khẩu</Label>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <span>Chưa có tài khoản?</span>
            <Button variant="link" className="h-auto p-0 font-medium" asChild>
              <Link href="/register">Đăng ký</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}> 
      <LoginForm />
    </Suspense>
  )
}
