import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-center py-32 px-8">
        <p className="text-xs tracking-[0.22em] uppercase text-amber-500 mb-6 font-mono">
          Application intelligence
        </p>
        <h1 className="text-5xl font-normal leading-tight tracking-tight text-center max-w-2xl mb-8">
          One pipeline. One JD.{" "}
          <em className="italic text-amber-300">Every output stays consistent.</em>
        </h1>
        <p className="text-base text-zinc-400 text-center max-w-xl leading-relaxed mb-12">
          Paste, upload, or link a job description and your resume. Proteus runs
          both through a five-agent AI pipeline and returns a semantic match
          score, gap analysis, rewrite suggestions, and a cover letter.
        </p>
        <div className="flex gap-4">
          <Link
            href="/analyze"
            className="px-8 py-4 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/history"
            className="px-8 py-4 border border-zinc-700 text-zinc-300 rounded-lg hover:border-zinc-500 transition-colors"
          >
            View History
          </Link>
        </div>
      </main>
    </div>
  );
}
