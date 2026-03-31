"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PassportNav from "./PassportNav";
import CompetencyIcon from "./CompetencyIcon";
import { savePassport, loadPassportByUser, signOut } from "@/lib/supabase";

const STORAGE_KEY = "pdi-passaporte-data";
const STORAGE_PAGE_KEY = "pdi-passaporte-page";
const STORAGE_ID_KEY = "pdi-passaporte-id";

const TOTAL_PAGES = 14;

const COMPETENCIES = [
  { name: "Autoliderança", icon: "🦸", color: "bg-yellow-400", description: "Gerenciar a si mesmo com autonomia" },
  { name: "Comunicação", icon: "🗣️", color: "bg-pink-400", description: "Expressar ideias com clareza" },
  { name: "Foco em Resultado", icon: "🎯", color: "bg-red-400", description: "Orientação para entregas" },
  { name: "Inovação", icon: "🚀", color: "bg-purple-500", description: "Buscar soluções criativas" },
  { name: "Prestação de Serviços em Educação", icon: "📖", color: "bg-green-500", description: "Excelência educacional" },
  { name: "Liderar Pessoas", icon: "👥", color: "bg-orange-400", description: "Inspirar e desenvolver equipes" },
  { name: "Sustentabilidade", icon: "🌿", color: "bg-emerald-500", description: "Responsabilidade socioambiental" },
  { name: "Tomada de Decisão", icon: "🧭", color: "bg-blue-500", description: "Decidir com assertividade" },
  { name: "Trabalho Colaborativo", icon: "🤝", color: "bg-teal-500", description: "Cooperar para resultados" },
];

const DEFAULT_DATA = {
  nome: "",
  unidade: "",
  talentos: ["", "", "", "", ""],
  workshopDate: "",
  encontros: [
    { com: "", data: "" },
    { com: "", data: "" },
    { com: "", data: "" },
  ],
  mapaDate: "",
  tutorDate: "",
  carimboDate: "",
  reflexoes: "",
  parada1: { data: "", texto: "" },
  parada2: { data: "", texto: "" },
  parada3: { data: "", texto: "" },
  encerramento: "",
};

interface PassportProps {
  userId: string;
  onLogout: () => void;
}

export default function Passport({ userId, onLogout }: PassportProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState(DEFAULT_DATA);
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved" | "error">("");
  const [recordId, setRecordId] = useState<string | null>(null);
  const isFirstLoad = useRef(true);

  // Carregar dados do Supabase ao abrir
  useEffect(() => {
    async function loadData() {
      try {
        const savedPage = localStorage.getItem(STORAGE_PAGE_KEY);
        if (savedPage) setCurrentPage(Number(savedPage));
        const cloudData = await loadPassportByUser(userId);
        if (cloudData) {
          setRecordId(cloudData.id || null);
          setFormData({
            nome: cloudData.nome,
            unidade: cloudData.unidade,
            talentos: cloudData.talentos,
            workshopDate: cloudData.workshop_date,
            encontros: cloudData.encontros,
            mapaDate: cloudData.mapa_date,
            tutorDate: cloudData.tutor_date,
            carimboDate: cloudData.carimbo_date,
            reflexoes: cloudData.reflexoes,
            parada1: cloudData.parada1,
            parada2: cloudData.parada2,
            parada3: cloudData.parada3,
            encerramento: cloudData.encerramento,
          });
        }
      } catch { /* usa dados padrão */ }
      isFirstLoad.current = false;
    }
    loadData();
  }, [userId]);

  // Salvar automaticamente no Supabase
  const saveData = useCallback(async () => {
    if (isFirstLoad.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setSaveStatus("saving");
      const result = await savePassport({
        id: recordId || undefined,
        nome: formData.nome,
        unidade: formData.unidade,
        talentos: formData.talentos,
        workshop_date: formData.workshopDate,
        encontros: formData.encontros,
        mapa_date: formData.mapaDate,
        tutor_date: formData.tutorDate,
        carimbo_date: formData.carimboDate,
        reflexoes: formData.reflexoes,
        parada1: formData.parada1,
        parada2: formData.parada2,
        parada3: formData.parada3,
        encerramento: formData.encerramento,
      }, userId);
      if (result?.id && !recordId) setRecordId(result.id);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  }, [formData, recordId, userId]);

  useEffect(() => {
    const timer = setTimeout(saveData, 1500);
    return () => clearTimeout(timer);
  }, [formData, saveData]);

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  // Salvar página atual
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PAGE_KEY, String(currentPage));
    } catch {
      // Ignora erro
    }
  }, [currentPage]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateTalento = (index: number, value: string) => {
    setFormData((prev) => {
      const talentos = [...prev.talentos];
      talentos[index] = value;
      return { ...prev, talentos };
    });
  };

  const updateEncontro = (index: number, field: "com" | "data", value: string) => {
    setFormData((prev) => {
      const encontros = [...prev.encontros];
      encontros[index] = { ...encontros[index], [field]: value };
      return { ...prev, encontros };
    });
  };

  const updateParada = (num: 1 | 2 | 3, field: "data" | "texto", value: string) => {
    const key = `parada${num}` as "parada1" | "parada2" | "parada3";
    setFormData((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const pages = [
    // PAGE 0: CAPA
    <div key="capa" className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-b from-senac-blue to-blue-900 text-white rounded-3xl p-8 passport-shadow animate-fade-in">
      <div className="text-5xl font-bold tracking-wider mb-2">
        <span className="text-senac-yellow">Senac</span>
      </div>
      <div className="w-24 h-0.5 bg-senac-orange my-6" />
      <h1 className="text-3xl md:text-4xl font-bold text-center tracking-wide">PASSAPORTE</h1>
      <p className="text-lg text-blue-200 mt-1">minha jornada de desenvolvimento</p>
      <p className="text-5xl font-bold text-senac-yellow mt-4">2026</p>
      <div className="flex gap-2 mt-6">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-senac-yellow text-2xl">★</span>
        ))}
      </div>
      <div className="mt-6 w-32 h-32 rounded-full border-4 border-senac-yellow/50 flex items-center justify-center bg-white/10">
        <span className="text-6xl">✈️</span>
      </div>
      <h2 className="text-2xl font-bold mt-6 tracking-widest">— LIDERANÇA —</h2>
      <div className="mt-6 text-center text-sm text-blue-200">
        <p className="font-bold">PDI — Plano de Desenvolvimento Individual</p>
      </div>
    </div>,

    // PAGE 1: INTRO
    <div key="intro" className="min-h-[80vh] bg-gradient-to-b from-senac-yellow to-amber-400 rounded-3xl p-8 passport-shadow animate-fade-in">
      <div className="space-y-4 mb-8">
        <div>
          <label className="text-sm font-bold text-senac-blue uppercase">Nome:</label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => updateField("nome", e.target.value)}
            className="w-full mt-1 p-3 rounded-xl bg-white text-gray-800 border-2 border-white text-lg"
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-senac-blue uppercase">Unidade:</label>
          <input
            type="text"
            value={formData.unidade}
            onChange={(e) => updateField("unidade", e.target.value)}
            className="w-full mt-1 p-3 rounded-xl bg-white text-gray-800 border-2 border-white text-lg"
            placeholder="Senac Tatuapé"
          />
        </div>
      </div>
      <div className="bg-senac-blue text-white rounded-full p-8 text-center max-w-sm mx-auto">
        <h2 className="text-xl font-bold mb-3">Siga a sua jornada!</h2>
        <p className="text-sm leading-relaxed">
          Você está iniciando o seu ciclo de PDI, e este é o seu passaporte de desenvolvimento.
        </p>
        <p className="text-sm leading-relaxed mt-3">
          A cada página, você encontrará um espaço para refletir sobre sua trajetória, celebrar conquistas e planejar os próximos passos.
        </p>
        <p className="text-sm leading-relaxed mt-3">
          Use este documento como uma ferramenta de autoconhecimento e crescimento contínuo.
        </p>
      </div>
    </div>,

    // PAGE 2: 5 TALENTOS
    <div key="talentos" className="min-h-[80vh] bg-gradient-to-b from-senac-yellow to-amber-300 rounded-3xl p-8 passport-shadow animate-fade-in">
      <div className="mb-6">
        <p className="text-senac-blue font-medium leading-relaxed">
          Toda boa viagem começa reconhecendo o que já temos com a gente.
        </p>
        <p className="text-senac-blue text-sm mt-3 leading-relaxed">
          No seu caminho de desenvolvimento, essa bagagem são os seus <strong>talentos</strong>: jeitos naturais de pensar, sentir e agir que fazem parte de quem você é. Eles ajudam você a se orientar, fazer escolhas e aproveitar melhor cada etapa da jornada.
        </p>
        <p className="text-senac-blue text-sm mt-3 font-bold">
          A seguir, preencha os seus 5 talentos dominantes, que serão seus companheiros de viagem durante todo o PDI.
        </p>
      </div>
      <div className="space-y-3">
        {formData.talentos.map((talento, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-8 h-8 bg-senac-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
              {i + 1}
            </span>
            <input
              type="text"
              value={talento}
              onChange={(e) => updateTalento(i, e.target.value)}
              className="flex-1 p-3 rounded-xl bg-white text-gray-800 border-2 border-white text-sm"
              placeholder={`Talento dominante ${i + 1}`}
            />
          </div>
        ))}
      </div>
    </div>,

    // PAGE 3: COMPETENCIAS INTRO
    <div key="comp-intro" className="min-h-[80vh] bg-gradient-to-b from-amber-50 to-senac-yellow/20 rounded-3xl p-8 passport-shadow animate-fade-in">
      <div className="bg-senac-yellow rounded-xl p-4 mb-6 flex items-center gap-3">
        <span className="text-3xl">🗺️</span>
        <h2 className="text-xl font-bold text-senac-blue">
          AS COMPETÊNCIAS ESSENCIAIS COMO SEU MAPA DE VIAGEM
        </h2>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Toda jornada precisa de um mapa.</h3>
        <p className="text-gray-600 leading-relaxed">
          Na sua jornada de desenvolvimento, as <strong>competências essenciais</strong> cumprem esse papel: representam o que o Senac valoriza e orientam os comportamentos esperados no dia a dia.
        </p>
        <p className="text-gray-600 leading-relaxed">
          O PDI é o seu guia de desenvolvimento profissional, ele ajuda a definir onde concentrar seus esforços e quais ações colocar em prática, alinhando seu caminho às expectativas e propósitos da instituição.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Ao iniciar o seu PDI, você traça um percurso consciente de aprimoramento, amplia seu autoconhecimento e fortalece sua contribuição para os resultados institucionais. E, ao mesmo tempo, desenvolve competências que ampliam suas possibilidades de atuação e evolução na carreira.
        </p>
      </div>
    </div>,

    // PAGE 4: 9 COMPETENCIAS GRID
    <div key="comp-grid" className="min-h-[80vh] bg-gradient-to-b from-amber-50 to-white rounded-3xl p-8 passport-shadow animate-fade-in">
      <h2 className="text-xl font-bold text-senac-blue text-center mb-8">As 9 Competências Essenciais</h2>
      <div className="grid grid-cols-3 gap-6 justify-items-center">
        {COMPETENCIES.map((comp) => (
          <CompetencyIcon key={comp.name} {...comp} />
        ))}
      </div>
      {/* TODO: Substituir src do QR Code e href do botão */}
      <div className="mt-8 bg-senac-yellow rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-senac-blue/30 shrink-0">
          {/* TODO: Trocar pelo QR Code real: <img src="/qrcode-competencias.png" alt="QR Code Competências" className="w-full h-full object-contain p-1" /> */}
          <span className="text-xs text-gray-400 text-center px-2">QR Code aqui</span>
        </div>
        <div className="flex-1 text-center sm:text-left space-y-3">
          <p className="text-lg font-bold text-senac-blue uppercase leading-tight">
            Acesse o QR Code para conhecer cada competência essencial.
          </p>
          <a
            href="# TODO: COLOCAR LINK AQUI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-senac-blue text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-900 transition-colors"
          >
            <span className="text-xl">🔗</span>
            Acessar Competências
          </a>
        </div>
      </div>
    </div>,

    // PAGE 5: ETAPAS 1-2
    <div key="etapas12" className="min-h-[80vh] bg-gradient-to-b from-senac-green to-emerald-700 text-white rounded-3xl p-8 passport-shadow animate-fade-in">
      <h2 className="text-xl font-bold mb-2 uppercase tracking-wide">
        Toda grande viagem inicia com um primeiro passo
      </h2>
      <p className="text-emerald-200 text-sm mb-6">
        Siga em frente: escute, reflita e alinhe. Cada etapa é fundamental para o seu desenvolvimento.
      </p>

      <div className="space-y-6">
        <div className="bg-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 bg-white text-senac-green rounded-full flex items-center justify-center font-bold">1</span>
            <div>
              <h3 className="font-bold">PONTO DE PARTIDA</h3>
              <p className="text-emerald-200 text-xs">Workshop de PDI ou atividade de reconexão.</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-emerald-200">Realizado em:</label>
            <input
              type="date"
              value={formData.workshopDate}
              onChange={(e) => updateField("workshopDate", e.target.value)}
              className="w-full mt-1 p-2 rounded-lg bg-white/20 text-white border border-white/30 text-sm"
            />
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 bg-white text-senac-green rounded-full flex items-center justify-center font-bold">2</span>
            <div>
              <h3 className="font-bold">ENCONTROS</h3>
              <p className="text-emerald-200 text-xs">Faça três conversas de feedback.</p>
            </div>
          </div>
          <div className="space-y-3">
            {formData.encontros.map((enc, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-emerald-200">Conversa com:</label>
                  <input
                    type="text"
                    value={enc.com}
                    onChange={(e) => updateEncontro(i, "com", e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-white/20 text-white border border-white/30 text-sm placeholder-white/50"
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <label className="text-xs text-emerald-200">Data:</label>
                  <input
                    type="date"
                    value={enc.data}
                    onChange={(e) => updateEncontro(i, "data", e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg bg-white/20 text-white border border-white/30 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,

    // PAGE 6: ETAPAS 3-5
    <div key="etapas35" className="min-h-[80vh] bg-gradient-to-b from-emerald-600 to-senac-green rounded-3xl p-8 passport-shadow animate-fade-in text-white">
      <div className="space-y-6">
        <div className="bg-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 bg-white text-senac-green rounded-full flex items-center justify-center font-bold">3</span>
            <div>
              <h3 className="font-bold">MAPA ATUALIZADO</h3>
              <p className="text-emerald-200 text-xs">Registre seu plano na plataforma de PDI.</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-emerald-200">Realizado em:</label>
            <input
              type="date"
              value={formData.mapaDate}
              onChange={(e) => updateField("mapaDate", e.target.value)}
              className="w-full mt-1 p-2 rounded-lg bg-white/20 text-white border border-white/30 text-sm"
            />
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 bg-white text-senac-green rounded-full flex items-center justify-center font-bold">4</span>
            <div>
              <h3 className="font-bold">PARADA COM O TUTOR</h3>
              <p className="text-emerald-200 text-xs">Conversa para alinhar seu desenvolvimento.</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-emerald-200">Realizada em:</label>
            <input
              type="date"
              value={formData.tutorDate}
              onChange={(e) => updateField("tutorDate", e.target.value)}
              className="w-full mt-1 p-2 rounded-lg bg-white/20 text-white border border-white/30 text-sm"
            />
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 bg-white text-senac-green rounded-full flex items-center justify-center font-bold">5</span>
            <div>
              <h3 className="font-bold">CARIMBO FINAL</h3>
              <p className="text-emerald-200 text-xs">Publicação do seu PDI para aprovação do tutor.</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-emerald-200">Meu prazo é:</label>
            <input
              type="date"
              value={formData.carimboDate}
              onChange={(e) => updateField("carimboDate", e.target.value)}
              className="w-full mt-1 p-2 rounded-lg bg-white/20 text-white border border-white/30 text-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-senac-green font-bold text-lg">✅ PLANEJAMENTO REALIZADO COM SUCESSO!</p>
          <p className="text-gray-500 text-sm mt-1">Mas a sua jornada está apenas começando. Chegou a hora da execução...</p>
        </div>
      </div>
    </div>,

    // PAGE 7: PLANO DE AÇÃO
    <div key="plano" className="min-h-[80vh] bg-gradient-to-b from-senac-teal to-teal-800 text-white rounded-3xl p-8 passport-shadow animate-fade-in">
      <h2 className="text-xl font-bold italic mb-4">A força do plano de ação no seu desenvolvimento</h2>
      <p className="text-teal-100 leading-relaxed mb-6">
        Um plano de desenvolvimento efetivo vai além de cursos. Ele se fortalece nas experiências do dia a dia, das trocas com colegas e desafios do trabalho até as oportunidades de aplicar o que se aprende.
      </p>
      <div className="bg-white/10 rounded-2xl p-5 mb-6">
        <h3 className="font-bold mb-2">💡 Precisa de inspiração para definir suas ações?</h3>
        <p className="text-teal-200 text-sm">
          No portfólio da <strong>Educação Corporativa</strong>, você também encontra diversos cursos relacionados às competências essenciais.
        </p>
      </div>
      <div className="bg-senac-yellow text-senac-blue rounded-2xl p-5">
        <h3 className="font-bold mb-2">📋 Workshop de Plano de Ação de PDI</h3>
        <p className="text-sm">
          Inscreva-se para o Workshop que vai te ajudar a transformar o PDI em uma ferramenta intencional e efetiva para o seu desenvolvimento.
        </p>
      </div>
    </div>,

    // PAGE 8: REFLEXÕES
    <div key="reflexoes" className="min-h-[80vh] bg-gradient-to-b from-senac-blue to-blue-900 rounded-3xl p-8 passport-shadow animate-fade-in">
      <div className="bg-blue-800 rounded-xl p-3 mb-4 flex items-center gap-2">
        <span className="text-2xl">📝</span>
        <p className="text-white text-sm font-medium">
          Aproveite esse espaço em branco para registrar os principais aprendizados e reflexões do seu PDI.
        </p>
      </div>
      <textarea
        value={formData.reflexoes}
        onChange={(e) => updateField("reflexoes", e.target.value)}
        className="w-full h-[55vh] p-4 rounded-2xl bg-white text-gray-800 border-2 border-white resize-none text-sm leading-relaxed"
        placeholder="Escreva aqui seus aprendizados, reflexões e insights ao longo da jornada..."
      />
    </div>,

    // PAGE 9: MARCOS
    <div key="marcos" className="min-h-[80vh] bg-gradient-to-b from-senac-pink to-pink-800 text-white rounded-3xl p-8 passport-shadow animate-fade-in">
      <h2 className="text-2xl font-bold mb-2 uppercase">Marcos na sua jornada</h2>
      <p className="text-pink-200 leading-relaxed mb-6">
        Chegou a hora de dar vida ao seu plano! A execução das ações que você planejou é o pontapé da 2ª etapa da sua jornada.
      </p>
      <p className="text-pink-100 leading-relaxed mb-6">
        Reserve um momento a cada período para refletir sobre a sua caminhada. Essas pausas são oportunidades valiosas para reconhecer suas conquistas, aprender com os desafios e, se necessário, ajustar a rota.
      </p>
      <div className="bg-white/10 rounded-2xl p-5">
        <p className="font-bold text-senac-yellow">⚠️ Atenção!</p>
        <p className="text-pink-100 text-sm mt-1">
          Não se esqueça de atualizar a plataforma do PDI sempre que fizer ajustes ou concluir alguma ação.
        </p>
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <div className="text-center">
          <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-blue-500" />
          <span className="text-xl">🚩</span>
        </div>
        <div className="text-center">
          <div className="w-0 h-0 border-l-[35px] border-r-[35px] border-b-[60px] border-l-transparent border-r-transparent border-b-green-500" />
          <span className="text-xl">🏴</span>
        </div>
        <div className="text-center">
          <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-yellow-400" />
          <span className="text-xl">🏁</span>
        </div>
      </div>
    </div>,

    // PAGE 10: 1ª PARADA
    <div key="parada1" className="min-h-[80vh] bg-gradient-to-b from-senac-orange to-orange-600 text-white rounded-3xl p-8 passport-shadow animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl">🚩</span>
        <h2 className="text-2xl font-bold">1ª PARADA!</h2>
      </div>
      <div>
        <label className="text-sm font-medium text-orange-200">Data planejada:</label>
        <input
          type="date"
          value={formData.parada1.data}
          onChange={(e) => updateParada(1, "data", e.target.value)}
          className="w-full mt-1 p-2 rounded-lg bg-white/20 text-white border border-white/30 text-sm mb-4"
        />
      </div>
      <div className="bg-white/10 rounded-2xl p-5 mb-4">
        <p className="font-medium mb-3">Nesta primeira pausa, procure pensar nas seguintes questões:</p>
        <ul className="text-sm space-y-2 text-orange-100">
          <li>• Quais ações do meu PDI já consegui colocar em prática?</li>
          <li>• Que aprendizados ou mudanças já percebo no meu comportamento ou atitude?</li>
          <li>• Em quais situações minhas atitudes fizeram diferença no dia a dia?</li>
        </ul>
      </div>
      <textarea
        value={formData.parada1.texto}
        onChange={(e) => updateParada(1, "texto", e.target.value)}
        className="w-full h-40 p-4 rounded-2xl bg-white text-gray-800 border-2 border-white resize-none text-sm"
        placeholder="Registre suas percepções, conquistas e aprendizados..."
      />
    </div>,

    // PAGE 11: 2ª PARADA
    <div key="parada2" className="min-h-[80vh] bg-gradient-to-b from-senac-red to-red-800 text-white rounded-3xl p-8 passport-shadow animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl">🏴</span>
        <h2 className="text-2xl font-bold">2ª PARADA!</h2>
      </div>
      <div>
        <label className="text-sm font-medium text-red-200">Data planejada:</label>
        <input
          type="date"
          value={formData.parada2.data}
          onChange={(e) => updateParada(2, "data", e.target.value)}
          className="w-full mt-1 p-2 rounded-lg bg-white/20 text-white border border-white/30 text-sm mb-4"
        />
      </div>
      <div className="bg-white/10 rounded-2xl p-5 mb-4">
        <p className="font-medium mb-3">Você já está no meio do caminho. Que tal pensar nas seguintes perguntas?</p>
        <ul className="text-sm space-y-2 text-red-100">
          <li>• Que mudança de comportamento já consigo perceber no meu dia a dia?</li>
          <li>• Recebi feedback do meu gestor ou colegas que confirme essas mudanças? (Se ainda não, que tal perguntar?)</li>
          <li>• Quais resultados consigo notar no meu trabalho como fruto do meu desenvolvimento?</li>
        </ul>
      </div>
      <textarea
        value={formData.parada2.texto}
        onChange={(e) => updateParada(2, "texto", e.target.value)}
        className="w-full h-40 p-4 rounded-2xl bg-white text-gray-800 border-2 border-white resize-none text-sm"
        placeholder="Registre suas percepções, conquistas e aprendizados..."
      />
    </div>,

    // PAGE 12: 3ª PARADA
    <div key="parada3" className="min-h-[80vh] bg-gradient-to-b from-senac-yellow to-amber-500 rounded-3xl p-8 passport-shadow animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl">🏁</span>
        <h2 className="text-2xl font-bold text-senac-blue">3ª PARADA!</h2>
      </div>
      <div>
        <label className="text-sm font-medium text-amber-700">Data planejada:</label>
        <input
          type="date"
          value={formData.parada3.data}
          onChange={(e) => updateParada(3, "data", e.target.value)}
          className="w-full mt-1 p-2 rounded-lg bg-white/80 text-gray-800 border border-amber-300 text-sm mb-4"
        />
      </div>
      <div className="bg-white/60 rounded-2xl p-5 mb-4">
        <p className="font-medium text-senac-blue mb-3">Você está na reta final! Vale a pena fazer uma última reflexão para concluir sua jornada de aprendizado com sucesso.</p>
        <ul className="text-sm space-y-2 text-gray-700">
          <li>• Quais mudanças reais percebi em mim ao longo do ciclo, alinhadas aos objetivos que defini no meu PDI?</li>
          <li>• Qual competência sinto que mais evoluí e o que quero manter como prática nos próximos ciclos?</li>
          <li>• Que aprendizados levo como bagagem para o futuro e há algum objetivo que quero levar adiante ou alterar o rumo?</li>
        </ul>
      </div>
      <textarea
        value={formData.parada3.texto}
        onChange={(e) => updateParada(3, "texto", e.target.value)}
        className="w-full h-40 p-4 rounded-2xl bg-white text-gray-800 border-2 border-white resize-none text-sm"
        placeholder="Registre suas percepções, conquistas e aprendizados..."
      />
    </div>,

    // PAGE 13: CONCLUSÃO
    <div key="conclusao" className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-b from-senac-blue to-blue-900 text-white rounded-3xl p-8 passport-shadow animate-fade-in">
      <div className="text-center">
        <label className="text-sm text-blue-200">Data do encerramento do meu ciclo de PDI:</label>
        <input
          type="date"
          value={formData.encerramento}
          onChange={(e) => updateField("encerramento", e.target.value)}
          className="w-full mt-1 p-2 rounded-lg bg-white/20 text-white border border-white/30 text-sm max-w-xs mx-auto block mb-6"
        />
      </div>
      <h2 className="text-3xl font-bold italic text-senac-yellow">Parabéns!</h2>
      <p className="text-blue-200 mt-2 text-center">
        Sua jornada foi incrível,<br />cheia de desafios e aprendizados.
      </p>
      <div className="mt-8 w-32 h-32 rounded-full border-4 border-blue-300/30 flex items-center justify-center bg-white/10">
        <span className="text-6xl">🌱</span>
      </div>
      <div className="mt-8 text-center">
        <div className="text-3xl font-bold tracking-wider text-senac-yellow">
          Senac
        </div>
        <p className="text-sm text-blue-200 mt-2 font-bold">PDI — Plano de Desenvolvimento Individual</p>
      </div>
    </div>,
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Barra superior com logout */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-senac-red transition-colors"
        >
          Sair da conta
        </button>
      </div>
      {saveStatus && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50 animate-fade-in ${
          saveStatus === "saving" ? "bg-senac-yellow text-senac-blue" :
          saveStatus === "saved" ? "bg-senac-green text-white" :
          "bg-senac-red text-white"
        }`}>
          {saveStatus === "saving" && "Salvando na nuvem..."}
          {saveStatus === "saved" && "Salvo na nuvem"}
          {saveStatus === "error" && "Salvo localmente (sem conexão)"}
        </div>
      )}
      <div key={currentPage} className="animate-slide-in">
        {pages[currentPage]}
      </div>
      <PassportNav
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
