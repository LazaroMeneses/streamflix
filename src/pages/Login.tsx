import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type View = "login" | "forgot" | "forgot-sent";

export default function Login() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
      toast({ title: "Bienvenido de vuelta", description: "Has iniciado sesión correctamente.", duration: 3000 });
      setLocation("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      toast({ title: "Error", description: mapFirebaseError(message), variant: "destructive", duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setView("forgot-sent");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      toast({ title: "Error", description: mapResetError(message), variant: "destructive", duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url(https://picsum.photos/seed/loginbg/1920/1080)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card/90 backdrop-blur-md border border-border rounded-2xl p-6 sm:p-8 shadow-2xl">

          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <Link href="/">
              <span className="text-3xl font-black tracking-tighter cursor-pointer">
                Stream<span className="text-primary">Flix</span>
              </span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {/* ── LOGIN ── */}
            {view === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-xl font-bold mb-1 text-center">Iniciar sesión</h1>
                <p className="text-muted-foreground text-sm text-center mb-6">Accede a tu cuenta para continuar</p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      required
                      data-testid="input-email"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11"
                      required
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-sm text-primary hover:underline font-medium"
                      data-testid="button-forgot-password"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-bold text-base"
                    disabled={loading}
                    data-testid="button-login-submit"
                  >
                    {loading
                      ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      : <><LogIn className="w-4 h-4 mr-2" />Iniciar sesión</>}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  ¿No tienes cuenta?{" "}
                  <Link href="/register">
                    <span className="text-primary font-semibold hover:underline cursor-pointer" data-testid="link-go-register">
                      Crear cuenta
                    </span>
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {view === "forgot" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => setView("login")}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
                  data-testid="button-back-to-login"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
                </button>

                <h1 className="text-xl font-bold mb-1">Restablecer contraseña</h1>
                <p className="text-muted-foreground text-sm mb-6">
                  Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
                </p>

                <form onSubmit={handleReset} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Tu correo electrónico"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10 h-11"
                      required
                      autoFocus
                      data-testid="input-reset-email"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 font-bold" disabled={loading} data-testid="button-send-reset">
                    {loading
                      ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      : <><Send className="w-4 h-4 mr-2" />Enviar enlace de restablecimiento</>}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── RESET SENT ── */}
            {view === "forgot-sent" && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Correo enviado</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Si <span className="font-semibold text-foreground">{resetEmail}</span> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos. Revisa también tu carpeta de spam.
                </p>
                <Button
                  onClick={() => setView("login")}
                  variant="outline"
                  className="w-full"
                  data-testid="button-back-after-reset"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Volver al inicio de sesión
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function mapFirebaseError(msg: string): string {
  if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential"))
    return "Correo o contraseña incorrectos.";
  if (msg.includes("too-many-requests")) return "Demasiados intentos. Intenta más tarde.";
  if (msg.includes("network-request-failed")) return "Error de red. Revisa tu conexión.";
  return "Error al iniciar sesión. Inténtalo de nuevo.";
}

function mapResetError(msg: string): string {
  if (msg.includes("user-not-found")) return "No existe una cuenta con ese correo.";
  if (msg.includes("invalid-email")) return "El correo no es válido.";
  if (msg.includes("too-many-requests")) return "Demasiados intentos. Intenta más tarde.";
  return "Error al enviar el correo. Inténtalo de nuevo.";
}
