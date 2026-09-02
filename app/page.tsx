// Internal workspace sites can read the authenticated OpenAI user from the
// forwarded request headers:
//
// import { headers } from "next/headers";
//
// export default async function Home() {
//   const requestHeaders = await headers();
//   const email = requestHeaders.get("oai-authenticated-user-email");
//   const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
//   const fullName =
//     encodedFullName &&
//     requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
//       "percent-encoded-utf-8"
//       ? decodeURIComponent(encodedFullName)
//       : null;
//   const displayName = fullName ?? email;
//   // ...
// }

"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, Lightbulb, Sparkles } from "lucide-react";

export default function Home() {
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("Start by finding a denominator that 4 and 2 can both use.");
  const [showExample, setShowExample] = useState(false);

  function checkStep() {
    const clean = answer.replaceAll(" ", "");
    if (clean.includes("6/4") || clean.includes("3/2")) {
      setMessage("Nice work — you found an equivalent fraction. What is 6/4 + 2/4?");
    } else if (clean.includes("4/6") || clean.includes("7/6")) {
      setMessage("Close! We need to change 1/2 into fourths first, then add only the numerators.");
    } else if (!clean) {
      setMessage("Try writing one equivalent fraction for 1/2 first.");
    } else {
      setMessage("Good attempt. Hint: multiply 1/2 by 2/2 so its denominator becomes 4.");
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e8efff,_transparent_32%),#f6f8fc] px-5 py-7 text-[#17233f] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold"><span className="grid size-10 place-items-center rounded-2xl bg-[#315bd6] text-white"><Sparkles size={20}/></span><span>Math Guide</span></div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#315bd6] shadow-sm">Fractions · Lesson 1</div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-[2rem] border border-[#dce3f0] bg-white p-6 shadow-[0_18px_55px_rgba(35,57,105,.10)] sm:p-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#315bd6]">Practice problem</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Let&apos;s add fractions.</h1>
            <p className="mt-3 text-lg text-[#65708a]">We&apos;ll work through one step at a time.</p>
            <div className="my-9 rounded-3xl bg-[#eef3ff] px-8 py-9 text-center text-4xl font-bold text-[#17233f]">3/4&nbsp; + &nbsp;1/2</div>

            <div className="rounded-3xl border border-[#dce3f0] p-5">
              <div className="flex gap-3"><span className="mt-0.5 text-[#e5a314]"><Lightbulb size={23}/></span><div><p className="font-bold">Your next step</p><p className="mt-1 leading-6 text-[#52607a]">{message}</p></div></div>
              <label className="mt-5 block text-sm font-semibold" htmlFor="step">Show what you would do next</label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row"><input id="step" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkStep()} placeholder="Example: 1/2 = 2/4" className="min-h-12 flex-1 rounded-xl border border-[#cbd5e1] px-4 text-base outline-none focus:ring-2 focus:ring-[#315bd6]"/><button onClick={checkStep} className="min-h-12 rounded-xl bg-[#315bd6] px-5 font-bold text-white transition hover:bg-[#244bbd]">Check step <ArrowRight className="ml-1 inline" size={17}/></button></div>
            </div>

            <button onClick={() => setShowExample(!showExample)} className="mt-5 flex items-center gap-2 text-sm font-bold text-[#315bd6]"><BookOpen size={18}/>{showExample ? "Hide similar example" : "Show a similar example"}</button>
            {showExample && <div className="mt-3 rounded-2xl bg-[#fff7e5] p-5 text-[#4a3510]"><p className="font-bold">Similar example: 1/3 + 1/6</p><p className="mt-2">Change 1/3 to 2/6. Now you can add 2/6 + 1/6.</p></div>}
          </section>

          <aside className="space-y-5">
            <section className="rounded-[2rem] bg-[#17233f] p-6 text-white"><p className="text-sm font-bold uppercase tracking-[.15em] text-[#aebfff]">Learning rule</p><h2 className="mt-3 text-2xl font-bold">We help you think, not copy.</h2><p className="mt-3 leading-6 text-[#d8e0ff]">Math Guide gives hints, examples, and feedback before showing a solution.</p></section>
            <section className="rounded-[2rem] border border-[#dce3f0] bg-white p-6"><p className="font-bold">Today&apos;s progress</p><div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e7ecf5]"><div className="h-full w-1/3 rounded-full bg-[#59b899]"/></div><p className="mt-3 text-sm text-[#65708a]">1 of 3 practice problems started</p><div className="mt-6 border-t border-[#e6eaf2] pt-5"><p className="text-sm font-bold">Next up</p><p className="mt-1 text-sm text-[#65708a]">Equivalent fractions</p></div></section>
          </aside>
        </div>
      </div>
    </main>
  );
}
