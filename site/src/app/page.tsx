"use client";

import { useState, useEffect } from "react";
import Passport from "@/components/Passport";
import LoginScreen from "@/components/LoginScreen";
import { getUser } from "@/lib/supabase";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const user = await getUser();
      if (user) setUserId(user.id);
      setLoading(false);
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-senac-blue to-blue-900">
        <div className="text-white text-center animate-fade-in">
          <div className="text-4xl font-bold text-senac-yellow mb-4">Senac</div>
          <p className="text-blue-200">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return <LoginScreen onLogin={(id) => setUserId(id)} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Passport userId={userId} onLogout={() => setUserId(null)} />
    </main>
  );
}
