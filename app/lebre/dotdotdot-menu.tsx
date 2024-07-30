"use client";

import { Tables } from '@/types/supabase';
import { atom, useAtom } from 'jotai';

export const dotMenuOpenIdAtom = atom<number | null>(null);

interface DotDotDotMenuProps {
    boardDayId: number;
    submitDelete: (formData: FormData)=>Promise<void>;
}

export function DotDotDotMenu({ boardDayId, submitDelete }: DotDotDotMenuProps) {
  const [dotMenuOpenId, setDotMenuOpenId] = useAtom(dotMenuOpenIdAtom);

  return (
    <div className='relative'>
      <button 
        className="px-3 text-neutral-400 mt-3"
        onClick={() => {
          setDotMenuOpenId(boardDayId);
        }}
      >
        ⋯
      </button>

      {(dotMenuOpenId === boardDayId) && 
        <form className="absolute left-3 top-full bg-background" >
          <input
            type="hidden"
            name="id"
            value={boardDayId}
          />
          <button 
            formAction={submitDelete}
            className="w-28 p-1 border text-sm text-neutral-400"
          >
            Delete entry
          </button>
        </form>
      }
    </div>
  );
}