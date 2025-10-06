
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const LoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login API call
    setTimeout(() => {
      // Demo credentials for testing
      if (email === "demo@3dmakes.it" && password === "password") {
        toast({
          title: "Accesso effettuato",
          description: "Benvenuto nell'area clienti!",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Errore di accesso",
          description: "Email o password non validi. Prova con demo@3dmakes.it / password",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Accedi all'area clienti</h1>
        <p className="text-brand-gray mt-2">Inserisci le tue credenziali per accedere</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="La tua email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-xs text-brand-accent hover:underline">
              Password dimenticata?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="La tua password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Accesso in corso..." : "Accedi"}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <p className="text-brand-gray">
          Non hai un account?{" "}
          <a href="#" className="text-brand-accent hover:underline">
            Contattaci per crearne uno
          </a>
        </p>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700 border border-blue-100">
        <p className="font-medium">Demo credenziali:</p>
        <p>Email: demo@3dmakes.it</p>
        <p>Password: password</p>
      </div>
    </div>
  );
};

export default LoginForm;
