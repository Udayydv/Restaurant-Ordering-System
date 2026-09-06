import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { restaurant } from "@/data/restaurant";

export function LoginDialog() {
  const {
    loginOpen,
    setLoginOpen,
    register,
    login,
    user,
  } = useAuth();

  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const close = () => {
    setLoginOpen(false);

    setTimeout(() => {
      setMode("login");
      setPassword("");
      setShowPassword(false);
    }, 200);
  };

  const goToLandingForRole = () => {
    // Small delay so AuthContext finishes committing the new user
    // before we branch on role.
    setTimeout(() => {
      const currentUser = JSON.parse(
        localStorage.getItem("tvr-user-v1") || "null",
      );

      if (currentUser?.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/" });
      }
    }, 100);
  };

  const submit = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (
      mode === "signup" &&
      (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    ) {
      toast.error("Password must include a letter and a number");
      return;
    }

    try {
      setLoading(true);

      if (mode === "signup") {
        await register(phone, password, name.trim());
        toast.success("Account created — you're logged in!");
      } else {
        await login(phone, password);
        toast.success("Logged in successfully");
      }

      close();
      goToLandingForRole();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : mode === "signup"
            ? "Unable to create account"
            : "Unable to login",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={loginOpen}
      onOpenChange={(v) =>
        v ? setLoginOpen(true) : close()
      }
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {mode === "login" ? "Login" : "Create your account"}
          </DialogTitle>

          <DialogDescription>
            {mode === "login"
              ? `Login with your mobile number and password to order at ${restaurant.brandName}.`
              : `Create an account to order faster at ${restaurant.brandName}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="login-name">Full name</Label>
              <Input
                id="login-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="login-phone">Mobile number</Label>

            <div className="flex items-center gap-2">
              <span className="rounded-xl border bg-muted px-3 py-2 text-sm font-semibold">
                +91
              </span>

              <Input
                id="login-phone"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>

            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder={
                  mode === "signup"
                    ? "At least 8 characters, with a letter & number"
                    : "Your password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            className="w-full rounded-full font-bold"
            onClick={submit}
            disabled={loading}
          >
            {loading
              ? mode === "signup"
                ? "Creating account..."
                : "Logging in..."
              : mode === "signup"
                ? "Create Account"
                : "Login"}
          </Button>

          <button
            type="button"
            onClick={() =>
              setMode((m) => (m === "login" ? "signup" : "login"))
            }
            disabled={loading}
            className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            {mode === "login"
              ? "New here? Create an account"
              : "Already have an account? Login"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
