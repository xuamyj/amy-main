import AuthButton from "@/components/AuthButton";
import { getUserId } from "@/utils/supabase/amy/helpers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import ClientNav from "./components/ClientNav";
import "./solstra-theme.css";

export const metadata: Metadata = {
  title: "Solstra",
  description: "Solstra section of the application",
};

export default async function SolstraLayout({
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
    <div className="solstra-container flex-1 w-full flex flex-col items-center">
      <nav className="solstra-nav w-full flex justify-center">
        <div className="w-full max-w-4xl flex flex-col justify-between items-center p-4 gap-3">
          <div className="self-end">
            <AuthButton />
          </div>
          <ClientNav />
        </div>
      </nav>
 
      {children}
      
      <footer className="w-full p-6 flex justify-center text-center text-sm mt-auto">
        {/* <p className="text-gray-600">
          Powered by{" "}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p> */}
      </footer>
    </div>
  )
}