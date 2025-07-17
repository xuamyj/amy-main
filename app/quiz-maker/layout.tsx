import AuthButton from "@/components/AuthButton";
import { getUserId } from "@/utils/supabase/amy/helpers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz Maker",
  description: "Generate your own personality quizzes!",
};

export default async function QuizMakerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    return redirect("/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10">
        <div className="w-full max-w-4xl flex flex-col justify-between items-center p-3 text-sm gap-2">
          <div className="self-end">
            <AuthButton />
          </div>
          <div className="self-start flex justify-start gap-3">
            <Link href="/quiz-maker" className="nav-button"> Quiz Maker Home </Link>
            <Link href="/quiz-maker/data-backup" className="nav-button"> Data Backup </Link>
          </div>
        </div>
      </nav>
 
      {children}
      
      <footer className="w-full border-t border-t-foreground/10 p-4 flex justify-center text-center text-xs mt-6">
        <p>
          Powered by{" "}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p>
      </footer>
    </div>
  )
}