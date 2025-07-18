"use client";

import { getCharacterColor } from "@/utils/solstra/game-content";

interface CharacterNameProps {
  name: string;
  className?: string;
}

export default function CharacterName({ name, className = "" }: CharacterNameProps) {
  const color = getCharacterColor(name);
  
  return (
    <span 
      className={`font-bold ${className}`}
      style={{ color }}
    >
      {name}
    </span>
  );
}