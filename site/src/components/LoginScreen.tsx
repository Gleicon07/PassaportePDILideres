"use client";

import { useState } from "react";
import { signIn, signUp, resetPassword, signInAnonymously } from "@/lib/supabase";

interface LoginScreenProps {
  onLogin: (userId: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isSignUp) {
      const { user, error: err } = await signUp(email, password);
      if (err) {
        setError(err.message === "User already registered"
          ? "Este email já está cadastrado. Faça login."
          : "Erro ao criar conta. Tente novamente.");
      } else if (user) {
        setSuccess("Conta criada! Verifique seu email para confirmar, depois faça login.");
        setIsSignUp(false);
      }
    } else {
      const { user, error: err } = await signIn(email, password);
      if (err) {
        setError("Email ou senha incorretos.");
      } else if (user) {
        onLogin(user.id);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-senac-blue to-blue-900 px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-white tracking-wider mb-2">
            <span className="text-senac-yellow">Senac</span>
          </div>
          <h1 className="text-xl text-white font-bold">Passaporte PDI</h1>
          <p className="text-blue-200 text-sm mt-1">Minha Jornada de Desenvolvimento 2026</p>
          <div className="flex justify-center gap-1 mt-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-senac-yellow text-lg">★</span>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-senac-blue text-center mb-6">
            {isSignUp ? "Criar Conta" : "Entrar"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border-2 border-gray-200 text-gray-800"
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border-2 border-gray-200 text-gray-800"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-senac-red text-sm p-3 rounded-lg">
                {error}
              </div>
            )}
            {!isSignUp && (
              <button
                type="button"
                onClick={async () => {
                  if (!email) { setError("Digite seu email primeiro."); return; }
                  setLoading(true);
                  const { error: err } = await resetPassword(email);
                  if (err) { setError("Erro ao enviar. Tente novamente."); }
                  else { setSuccess("Email de redefinição enviado! Verifique sua caixa de entrada."); setError(""); }
                  setLoading(false);
                }}
                className="text-senac-blue text-sm hover:underline"
              >
                Esqueceu sua senha?
              </button>
            )}
            {success && (
              <div className="bg-green-50 text-senac-green text-sm p-3 rounded-lg">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-senac-blue text-white font-bold rounded-xl hover:bg-senac-blue-light transition-colors disabled:opacity-50"
            >
              {loading ? "Aguarde..." : isSignUp ? "Criar Conta" : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccess(""); }}
              className="text-senac-blue text-sm hover:underline"
            >
              {isSignUp ? "Já tem conta? Faça login" : "Primeiro acesso? Crie sua conta"}
            </button>
            {!isSignUp && (
              <button
                onClick={async () => {
                  setLoading(true);
                  setError("");
                  const { user, error: err } = await signInAnonymously();
                  if (err) { setError("Erro ao entrar. Tente novamente."); }
                  else if (user) { onLogin(user.id); }
                  setLoading(false);
                }}
                disabled={loading}
                className="w-full py-3 bg-gray-100 text-senac-blue font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? "Aguarde..." : "Entrar como visitante"}
              </button>
            )}
          </div>
        </div>

        <p className="text-blue-300 text-xs text-center mt-6">
          PDI — Plano de Desenvolvimento Individual<br />
            </p>
      </div>
    </div>
  );
}
