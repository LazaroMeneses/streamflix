import { Link, useLocation } from "wouter";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useTheme } from "@/context/ThemeContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Search, Menu, X, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function Navbar() {
  const scrollPosition = useScrollPosition();
  const isScrolled = scrollPosition > 50;
  const { theme, toggleTheme } = useTheme();
  const { favorites } = useFavorites();
  const { user, logOut } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Catálogo", path: "/catalog" },
    { name: "Buscar", path: "/search" },
    { name: "Favoritos", path: "/favorites", badge: favorites.length },
    { name: "Perfil", path: "/profile" },
  ];

  const handleLogout = async () => {
    await logOut();
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente.", duration: 2500 });
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "SF";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm border-b" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer" data-testid="link-home-logo">
            <span className="text-2xl font-black tracking-tighter">
              Stream<span className="text-primary">Flix</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <span
                  data-testid={`link-nav-${link.name.toLowerCase()}`}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:text-primary ${
                    location === link.path ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {link.name}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </span>
              </Link>
            ))}

            <div className="pl-4 flex items-center space-x-2 border-l border-border/50">
              <Link href="/search" data-testid="link-nav-search-icon">
                <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-primary rounded-full">
                  <Search className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-foreground/80 hover:text-primary rounded-full"
                data-testid="button-toggle-theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {user ? (
                <div className="flex items-center gap-2 ml-1">
                  <Link href="/profile">
                    <div
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center cursor-pointer text-white text-xs font-black hover:opacity-80 transition-opacity"
                      data-testid="link-nav-avatar"
                      title={user.displayName ?? user.email ?? ""}
                    >
                      {initials}
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-foreground/60 hover:text-destructive rounded-full"
                    data-testid="button-logout"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="font-bold ml-1" data-testid="link-nav-login">
                    <LogIn className="w-4 h-4 mr-1" />
                    Entrar
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-foreground/80">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground/80"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                    location === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-accent/10 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {link.name}
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </div>
                </span>
              </Link>
            ))}
            <div className="pt-2 border-t border-border">
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive font-medium rounded-md hover:bg-destructive/10"
                  data-testid="button-mobile-logout"
                >
                  <LogOut className="w-4 h-4" /> Cerrar sesión ({user.displayName ?? user.email})
                </button>
              ) : (
                <Link href="/login">
                  <span
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-primary cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" /> Iniciar sesión
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
