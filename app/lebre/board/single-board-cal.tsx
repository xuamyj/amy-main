"use client";

import { Tables } from '@/types/supabase';
import { DAY_NAMES, getTodayPST } from '@/utils/supabase/amy/helpers';
import { useAtom } from 'jotai';
import { useMemo } from 'react';

// const isSomethingAtom = atom(false);

interface SingleBoardCalProps {
  board: Tables<'boards'>;
  boardDays: Tables<'board_days'>[] | null; 
  startWeekday: number; 
}

type SingleCalSquare = {
  dayNumber: number;
} | null

export function SingleBoardCal({ board, boardDays, startWeekday }: SingleBoardCalProps) {
  // const [shouldShowSkipped, setShouldShowSkipped] = useAtom(shouldShowSkippedAtom);

  // const currentDate = new Date('Feb 5, 2023 19:24:00');
  const currentDate = getTodayPST();
  const monthNumDays = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate();
  //this is 0-indexed from sunday
  const monthStartWeekday = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const options = { month: "long", year: "numeric"} as const;
  const monthStr = new Intl.DateTimeFormat("en-US", options).format(currentDate);

  const calendar2DArr = useMemo(() => {
    const result = [] as SingleCalSquare[][];
    
    for(let i = 0; i < 6; i++) {
      const weekArray = [] as SingleCalSquare[];
      for (let j = 0; j < 7; j++) {
        weekArray.push(null);
      }
      result.push(weekArray);
    }
    const dayIndexDelta = (monthStartWeekday - startWeekday + 7) % 7;
    for (let day = 1; day <= monthNumDays; day++) {
      const dayIndexInCalendar = day + dayIndexDelta - 1;
      const weekRowIndex = Math.floor(dayIndexInCalendar / 7);
      const dayColIndex = dayIndexInCalendar % 7;

      result[weekRowIndex][dayColIndex] = {
        dayNumber: day
      }
    }

    return result;

  }, []);

  console.log(calendar2DArr);
  console.log(JSON.stringify(calendar2DArr, undefined, 2))

  return (
    <div>
      <p>
        startWeekday: {startWeekday}
      </p>

      <h3>
        {monthStr}
      </h3>
      <div className="flex">
      {
        DAY_NAMES.map((_, index) => {
          const squareToDay = (index+startWeekday+7)%7;
          return (<div className="border px-4 py-3">
            {DAY_NAMES[squareToDay]}
          </div>);
        })
      }
      </div>

      <p>
        {monthNumDays} days in the month, starting on a {monthStartWeekday}
      </p>
      
    </div>
  );
}
