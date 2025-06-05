
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminPasswordProtectionProps {
  onPasswordCorrect: () => void;
}

export const AdminPasswordProtection = ({ onPasswordCorrect }: AdminPasswordProtectionProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Check if password is correct
    if (password === "tuhin@123") {
      toast({
        title: "Access Granted",
        description: "Welcome to the admin panel!",
      });
      onPasswordCorrect();
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Admin Access Required</h1>
          <p className="text-gray-400 mt-2">Please enter the admin password to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-yellow-400 text-black hover:bg-yellow-300"
          >
            {isLoading ? "Checking..." : "Access Admin Panel"}
          </Button>
        </form>
      </div>
    </div>
  );
};
