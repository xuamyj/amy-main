"use client";

import { Tables } from '@/types/supabase';
// import { atom, useAtom } from 'jotai';

// const isSomethingAtom = atom(false);

interface BoardWithDaysProps {
  boardDayTuples: (readonly [Tables<'boards'>, Tables<'board_days'>[] | null])[];
}

export function BoardWithDays({ boardDayTuples }: BoardWithDaysProps) {
  // const [isSomething, setSomething] = useAtom(isSomethingAtom);

  return (
    <div>
      {boardDayTuples && boardDayTuples.map(boardDayTuple => (
      <div key={`board-${boardDayTuple[0].id}`}>
        <h3>{boardDayTuple[0].board_title}</h3>

        {boardDayTuple[1] &&
        <ul>
          {boardDayTuple[1].map(boardDay => (
          <li key={`boardDay-${boardDay.id}`}>
            {boardDay.created_day} : {String(boardDay.done)}
          </li>
          ))}
        </ul>
        }
      </div>
      ))}
    </div>
  );
}
