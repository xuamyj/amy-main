"use client";

import { Tables } from '@/types/supabase';
import { useAtom } from 'jotai';
import { shouldShowSkippedAtom } from './calendar-filters';

// const isSomethingAtom = atom(false);

interface BoardWithDaysProps {
  boardDayTuples: (readonly [Tables<'boards'>, Tables<'board_days'>[] | null])[];
}

export function BoardWithDays({ boardDayTuples }: BoardWithDaysProps) {
  const [shouldShowSkipped, setShouldShowSkipped] = useAtom(shouldShowSkippedAtom);

  // console.log('Inside BoardWithDays, shouldShowSkipped is', shouldShowSkipped);

  return (
    <div>
      {boardDayTuples && boardDayTuples.map(boardDayTuple => (
      <div key={`board-${boardDayTuple[0].id}`}>
        <h3>{boardDayTuple[0].board_title}</h3>

        {boardDayTuple[1] &&
        <ul>
          {boardDayTuple[1].map(boardDay => (
          <li key={`boardDay-${boardDay.id}`}>
            {boardDay.created_day} : {String(boardDay.done)} {boardDay.notes && 
            <span>: {boardDay.notes}</span>
            }
          </li>
          ))}
        </ul>
        }
      </div>
      ))}
    </div>
  );
}
