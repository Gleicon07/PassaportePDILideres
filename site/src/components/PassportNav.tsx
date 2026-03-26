"use client";

const PAGE_LABELS = [
  "Capa",
  "Início",
  "Talentos",
  "Competências",
  "9 Competências",
  "Etapas 1-2",
  "Etapas 3-5",
  "Plano de Ação",
  "Reflexões",
  "Marcos",
  "1ª Parada",
  "2ª Parada",
  "3ª Parada",
  "Conclusão",
];

const PAGE_COLORS = [
  "bg-senac-blue",
  "bg-senac-yellow",
  "bg-senac-yellow",
  "bg-senac-yellow",
  "bg-senac-yellow",
  "bg-senac-green",
  "bg-senac-green",
  "bg-senac-teal",
  "bg-senac-blue",
  "bg-senac-pink",
  "bg-senac-orange",
  "bg-senac-red",
  "bg-senac-yellow",
  "bg-senac-blue",
];

interface PassportNavProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PassportNav({ currentPage, totalPages, onPageChange }: PassportNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-lg bg-senac-blue text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-senac-blue-light transition-colors text-sm"
          >
            ← Anterior
          </button>
          <span className="text-sm font-medium text-gray-600">
            {currentPage + 1} / {totalPages} — {PAGE_LABELS[currentPage]}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 rounded-lg bg-senac-blue text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-senac-blue-light transition-colors text-sm"
          >
            Próxima →
          </button>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`h-1.5 rounded-full flex-1 transition-all ${
                i === currentPage
                  ? `${PAGE_COLORS[i]} scale-y-150`
                  : i < currentPage
                  ? "bg-gray-400"
                  : "bg-gray-200"
              }`}
              title={PAGE_LABELS[i]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
