"use client";

import { SubmitButton } from '../login/submit-button';
// import { atom, useAtom } from 'jotai';

// const isSomethingAtom = atom(false);

interface BoardWithDoneButtonProps {
  remainingBoardsArr: {boardId: number, boardTitle: string}[];
  submitDone: (formData: FormData)=>Promise<void>;
  submitSkip: (formData: FormData)=>Promise<void>;
}

export function BoardWithDoneButton({ remainingBoardsArr, submitDone, submitSkip }: BoardWithDoneButtonProps) {
  // const [isSomething, setSomething] = useAtom(isSomethingAtom);

  return (
    <div>
      {remainingBoardsArr.map(item => (
        <div key={`board-${item.boardId}`} className="my-3">
          <form>
            <label htmlFor={`board-${item.boardId}`} className="label-like-h3">
              {item.boardTitle}
            </label>
            <div>
              <input 
                type="text" id={`board-${item.boardId}`} 
                name="notes" placeholder="[optional note]" 
                className="done-input" 
              />
              <input
                type="hidden"
                name="board_id"
                value={item.boardId}
              />
              <SubmitButton
                formAction={submitDone}
                className="todo-button done-button-colors"
                pendingText="Working..."
              >
                Done
              </SubmitButton>
              <SubmitButton
                formAction={submitSkip}
                className="todo-button skip-button-colors"
                pendingText="Working..."
              >
                Skip
              </SubmitButton>
            </div>
          </form>
        </div>
      ))}
    </div>
  );
}
