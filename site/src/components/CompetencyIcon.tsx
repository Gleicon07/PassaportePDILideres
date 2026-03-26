"use client";

interface CompetencyIconProps {
  name: string;
  icon: string;
  color: string;
  description: string;
}

export default function CompetencyIcon({ name, icon, color, description }: CompetencyIconProps) {
  return (
    <div className="flex flex-col items-center text-center group cursor-pointer">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-lg transition-transform group-hover:scale-110 ${color}`}
      >
        {icon}
      </div>
      <p className="mt-2 text-xs font-bold text-senac-blue uppercase leading-tight max-w-[100px]">
        {name}
      </p>
      <p className="mt-1 text-[10px] text-gray-500 max-w-[110px] opacity-0 group-hover:opacity-100 transition-opacity">
        {description}
      </p>
    </div>
  );
}
