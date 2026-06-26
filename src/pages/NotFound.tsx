import { Link } from "wouter";
import { motion } from "framer-motion";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background"
    >
      <div className="relative mb-8">
        <Film className="w-32 h-32 text-primary opacity-20" />
        <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-foreground">
          404
        </span>
      </div>
      
      <h1 className="text-4xl font-black mb-4 tracking-tighter">Director's Cut Not Found</h1>
      <p className="text-xl text-muted-foreground max-w-md mb-8">
        The scene you're looking for has been left on the cutting room floor. Let's get you back to the main feature.
      </p>
      
      <Link href="/">
        <Button size="lg" className="font-bold px-8 h-14" data-testid="button-404-home">
          Return to Home
        </Button>
      </Link>
    </motion.div>
  );
}
