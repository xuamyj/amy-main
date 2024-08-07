"use client";

import { SubmitButton } from '../login/submit-button';
// import { atom, useAtom } from 'jotai';

// const isSomethingAtom = atom(false);

interface DayNotesSectionProps {
  currDayNoteText: string | null;
  currDayNoteId: number | null;
  labelVerb: string; 
  submitFunction: (formData: FormData)=>Promise<void>;
}

export function DayNotesSection({ currDayNoteText, currDayNoteId, labelVerb, submitFunction }: DayNotesSectionProps) {
  // const [isSomething, setSomething] = useAtom(isSomethingAtom);

  return (
    <div>
      {currDayNoteText && <p>{currDayNoteText}</p>}
      {!currDayNoteText && <p>--</p>}

      <form className="mt-5">
        <label htmlFor={`note_${labelVerb}`}>
          {labelVerb} note:
        </label>
        <div className="flex items-start">
          <textarea 
            id={`note_${labelVerb}`} 
            name="notes"  
            className="done-input" 
            defaultValue={currDayNoteText || ""}
          />
          { currDayNoteId &&
            <input
              type="hidden"
              name="id"
              value={currDayNoteId}
            />
          }
          <SubmitButton
            formAction={submitFunction}
            className="todo-button done-button-colors"
            pendingText="Working..."
          >
            Save note
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
