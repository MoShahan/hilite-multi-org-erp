import { loginSchema, type LoginInput } from "@hilite/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { useAppDispatch } from "@/app/hooks";
import { store } from "@/app/store";
import { HiliteLogo } from "@/components/HiliteLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { selectAuthUser } from "@/features/auth/authSelectors";
import { login } from "@/features/auth/authSlice";
import { ApiClientError, resetSessionExpiredState } from "@/lib/api-client";

type LoginFormValues = LoginInput;

const LoginHeroGraphic = () => (
  <div className="relative mx-auto size-56">
    <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
    <div className="relative flex size-full items-center justify-center">
      <div className="absolute inset-4 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm" />
      <div className="absolute inset-8 rounded-[1.5rem] border border-white/15 bg-gradient-to-br from-white/15 to-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" />
      <HiliteLogo className="relative size-24 rounded-2xl border border-primary/30 shadow-[0_0_60px_rgba(0,0,0,0.35)]" />
    </div>
  </div>
);

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const canSubmit = form.formState.isValid && !form.formState.isSubmitting;

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);

    try {
      await dispatch(login(values)).unwrap();
      resetSessionExpiredState();

      const user = selectAuthUser(store.getState());
      toast.success("Signed in successfully", {
        description: user?.name
          ? `Welcome back, ${user.name}. You're ready to go.`
          : "Welcome back. You're ready to go.",
      });

      const redirectTo =
        (location.state as { from?: string } | null)?.from ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage("Unable to sign in. Please try again.");
    }
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[oklch(0.18_0.02_260)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(1 0 0 / 0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="pointer-events-none absolute -left-24 top-1/3 size-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-1/4 size-64 rounded-full bg-primary/15 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <HiliteLogo className="bg-white text-[oklch(0.18_0.02_260)]" />
          <span className="text-sm font-medium text-white/90">
            HILITE Sales OS
          </span>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center gap-10 py-16">
          <LoginHeroGraphic />
          <div className="max-w-md space-y-4 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Streamline your sales operations
            </h1>
            <p className="text-base leading-relaxed text-white/70">
              The unified platform for teams to manage leads, deals, and
              customer relationships with clarity and speed.
            </p>
          </div>
        </div>

        <p className="relative text-sm text-white/50">
          Trusted by sales teams who need one place to work.
        </p>
      </div>

      <div className="relative flex min-h-screen flex-col bg-background">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <HiliteLogo />
            <span className="text-sm font-medium text-muted-foreground">
              HILITE Sales OS
            </span>
          </div>

          <Card className="w-full max-w-[420px] border-border/60 shadow-lg">
            <CardHeader className="items-center space-y-4 text-center">
              <HiliteLogo />
              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  Welcome back!
                </CardTitle>
                <CardDescription>
                  Log in to your HILITE Sales OS account
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-5" onSubmit={onSubmit}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@company.com"
                            autoComplete="email"
                            className="h-10"
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="Enter a password"
                            autoComplete="current-password"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {errorMessage ? (
                    <p className="text-sm text-destructive">{errorMessage}</p>
                  ) : null}

                  <Button
                    className="h-10 w-full"
                    type="submit"
                    disabled={!canSubmit}
                  >
                    {form.formState.isSubmitting ? "Signing in..." : "Log in"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <p className="px-6 pb-6 text-center text-xs text-muted-foreground sm:px-10">
          By logging in, you agree to our{" "}
          <Link
            to="/privacy"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            to="/terms"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </div>
    </div>
  );
};
