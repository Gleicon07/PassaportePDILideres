import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- AUTH ---

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { user: data.user, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  return { error };
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// --- PASSPORT DATA ---

export interface PassportData {
  id?: string;
  user_id?: string;
  nome: string;
  unidade: string;
  talentos: string[];
  workshop_date: string;
  encontros: { com: string; data: string }[];
  mapa_date: string;
  tutor_date: string;
  carimbo_date: string;
  reflexoes: string;
  parada1: { data: string; texto: string };
  parada2: { data: string; texto: string };
  parada3: { data: string; texto: string };
  encerramento: string;
  created_at?: string;
  updated_at?: string;
}

function toDbPayload(data: PassportData) {
  return {
    nome: data.nome,
    unidade: data.unidade,
    talentos: JSON.stringify(data.talentos),
    workshop_date: data.workshop_date,
    encontros: JSON.stringify(data.encontros),
    mapa_date: data.mapa_date,
    tutor_date: data.tutor_date,
    carimbo_date: data.carimbo_date,
    reflexoes: data.reflexoes,
    parada1: JSON.stringify(data.parada1),
    parada2: JSON.stringify(data.parada2),
    parada3: JSON.stringify(data.parada3),
    encerramento: data.encerramento,
    updated_at: new Date().toISOString(),
  };
}

function fromDbRow(row: Record<string, unknown>): PassportData {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    nome: row.nome as string,
    unidade: (row.unidade as string) || "",
    talentos: JSON.parse(row.talentos as string),
    workshop_date: (row.workshop_date as string) || "",
    encontros: JSON.parse(row.encontros as string),
    mapa_date: (row.mapa_date as string) || "",
    tutor_date: (row.tutor_date as string) || "",
    carimbo_date: (row.carimbo_date as string) || "",
    reflexoes: (row.reflexoes as string) || "",
    parada1: JSON.parse(row.parada1 as string),
    parada2: JSON.parse(row.parada2 as string),
    parada3: JSON.parse(row.parada3 as string),
    encerramento: (row.encerramento as string) || "",
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function savePassport(data: PassportData, userId: string): Promise<{ id: string } | null> {
  const payload = { ...toDbPayload(data), user_id: userId };

  if (data.id) {
    const { error } = await supabase
      .from("passaportes")
      .update(payload)
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) {
      console.error("Erro ao atualizar:", error);
      return null;
    }
    return { id: data.id };
  }

  const { data: inserted, error } = await supabase
    .from("passaportes")
    .insert({ ...payload, created_at: new Date().toISOString() })
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao salvar:", error);
    return null;
  }
  return inserted;
}

export async function loadPassportByUser(userId: string): Promise<PassportData | null> {
  const { data, error } = await supabase
    .from("passaportes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return fromDbRow(data);
}
