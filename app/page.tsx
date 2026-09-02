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

import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Lightbulb, Sparkles } from "lucide-react";
import {
  analyzeEquivalentFractionAttempt,
  analyzeFractionAttempt,
  analyzeSimplificationAttempt,
  formatFraction,
  formatFractionAsWritten,
  type Fraction,
} from "@/lib/fractions";
import {
  equivalentFractionProblems,
  fractionProblems,
  simplifyingFractionProblems,
} from "@/lib/fraction-problems";
import {
  analyzeEquationAttempt,
} from "@/lib/equations";
import {
  analyzePercentageAttempt,
} from "@/lib/percentages";
import { percentageProblems } from "@/lib/percentage-problems";
import { equationProblems } from "@/lib/equation-problems";
import {
  loadCompletedLessons,
  saveCompletedLesson,
  type CompletedLesson,
} from "@/lib/lesson-progress";

type LessonMode = "addition" | "simplifying" | "equivalent" | "percentage" | "equations";

function getProblemHint(problem: { left: Fraction; right: Fraction }): string {
  return `Start by finding a denominator that ${problem.left.denominator} and ${problem.right.denominator} can both use.`;
}

function getSimplificationHint(fraction: Fraction): string {
  return `Look for a number greater than 1 that divides both ${fraction.numerator} and ${fraction.denominator}.`;
}

function getEquivalentHint(fraction: Fraction): string {
  return `Multiply both the numerator and denominator by the same number, such as 2 or 3.`;
}

function getPercentageHint(percent: number): string {
  return `Convert ${percent}% to a decimal by dividing by 100, or write it as a fraction over 100.`;
}

function getEquationHint(operation: "add" | "subtract" | "multiply" | "divide"): string {
  if (operation === "add") {
    return "Use the inverse operation: subtract the number from both sides.";
  }

  if (operation === "subtract") {
    return "Use the inverse operation: add the number to both sides.";
  }

  if (operation === "multiply") {
    return "Use the inverse operation: divide both sides by the coefficient.";
  }

  return "Use the inverse operation: multiply both sides by the divisor.";
}

function getLessonLabel(lessonType: string): string {
  if (lessonType === "equations") {
    return "One-step equations";
  }

  if (lessonType === "percentage") {
    return "Percentages";
  }

  if (lessonType === "simplifying") {
    return "Simplify fractions";
  }

  if (lessonType === "equivalent") {
    return "Equivalent fractions";
  }

  return "Add fractions";
}

export default function Home() {
  const [view, setView] = useState<"lesson" | "progress">("lesson");
  const [lessonMode, setLessonMode] = useState<LessonMode>("addition");
  const [problemIndex, setProblemIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [examplesUsed, setExamplesUsed] = useState(0);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState(() => getProblemHint(fractionProblems[0]));
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<CompletedLesson[]>([]);
  const completionSavedRef = useRef(false);

  useEffect(() => {
    setCompletedLessons(loadCompletedLessons());
  }, []);

  const currentAdditionProblem = fractionProblems[problemIndex];
  const currentSimplificationProblem = simplifyingFractionProblems[problemIndex];
  const currentEquivalentProblem = equivalentFractionProblems[problemIndex];
  const currentPercentageProblem = percentageProblems[problemIndex];
  const currentEquationProblem = equationProblems[problemIndex];
  const activeProblemCount = lessonMode === "addition"
    ? fractionProblems.length
    : lessonMode === "simplifying"
      ? simplifyingFractionProblems.length
      : lessonMode === "equivalent"
        ? equivalentFractionProblems.length
        : lessonMode === "percentage"
          ? percentageProblems.length
          : equationProblems.length;

  function markCurrentProblemCorrect() {
    setCompletedCount(problemIndex + 1);
    setIsCorrect(true);

    if (problemIndex === activeProblemCount - 1) {
      setIsLessonComplete(true);

      if (!completionSavedRef.current) {
        completionSavedRef.current = true;
        setCompletedLessons(saveCompletedLesson({
          lessonType: lessonMode,
          accuracy: Math.round(((problemIndex + 1) / (attemptCount + 1)) * 100),
          attempts: attemptCount + 1,
          hintsUsed,
          examplesUsed,
          completedAt: new Date().toISOString(),
        }));
      }
    }
  }

  function checkStep() {
    setAttemptCount((count) => count + 1);

    if (lessonMode === "addition") {
      const attemptKind = analyzeFractionAttempt(
        answer,
        currentAdditionProblem.left,
        currentAdditionProblem.right,
      );

      switch (attemptKind) {
        case "correct":
          setMessage("Correct! You found the sum using a common denominator.");
          markCurrentProblemCorrect();
          break;
        case "correct-not-simplified":
          setHintsUsed((count) => count + 1);
          setMessage("That is equivalent. Now simplify the fraction by dividing both parts by their greatest common factor.");
          setIsCorrect(false);
          break;
        case "added-denominators":
          setHintsUsed((count) => count + 1);
          setMessage("It looks like the denominators were added. Find a common denominator, then add only the numerators.");
          setIsCorrect(false);
          break;
        case "invalid":
          setHintsUsed((count) => count + 1);
          setMessage("Enter a fraction in numerator/denominator form, then start by matching the denominators.");
          setIsCorrect(false);
          break;
        case "needs-common-denominator":
          setHintsUsed((count) => count + 1);
          setMessage("Not yet. Rewrite both fractions with a common denominator, then add only the numerators.");
          setIsCorrect(false);
          break;
      }

      return;
    }

    if (lessonMode === "simplifying") {
      const attemptKind = analyzeSimplificationAttempt(
        answer,
        currentSimplificationProblem.fraction,
      );

      switch (attemptKind) {
        case "correct":
          setMessage("Correct! You simplified the fraction completely.");
          markCurrentProblemCorrect();
          break;
        case "correct-not-simplified":
          setHintsUsed((count) => count + 1);
          setMessage("That is equivalent. Keep looking for a common factor greater than 1.");
          setIsCorrect(false);
          break;
        case "invalid":
          setHintsUsed((count) => count + 1);
          setMessage("Enter a fraction in numerator/denominator form, then look for a common factor.");
          setIsCorrect(false);
          break;
        case "needs-simplifying":
          setHintsUsed((count) => count + 1);
          setMessage("Not yet. Divide the numerator and denominator by the same common factor.");
          setIsCorrect(false);
          break;
      }

      return;
    }

    if (lessonMode === "percentage") {
      const attemptKind = analyzePercentageAttempt(answer, currentPercentageProblem);

      switch (attemptKind) {
        case "correct":
          setMessage("Correct! You found the percent of the number.");
          markCurrentProblemCorrect();
          break;
        case "invalid":
          setHintsUsed((count) => count + 1);
          setMessage("Enter a number, then try converting the percent to a decimal or fraction.");
          setIsCorrect(false);
          break;
        case "needs-conversion":
          setHintsUsed((count) => count + 1);
          setMessage("Not yet. Convert the percent to a decimal by dividing by 100, then multiply by the number.");
          setIsCorrect(false);
          break;
      }

      return;
    }

    if (lessonMode === "equations") {
      const attemptKind = analyzeEquationAttempt(answer, currentEquationProblem);

      switch (attemptKind) {
        case "correct":
          setMessage("Correct! You used the inverse operation to solve for x.");
          markCurrentProblemCorrect();
          break;
        case "invalid":
          setHintsUsed((count) => count + 1);
          setMessage("Enter a number for x, then choose the inverse operation that undoes the equation.");
          setIsCorrect(false);
          break;
        case "needs-inverse-operation":
          setHintsUsed((count) => count + 1);
          setMessage(`Not quite. ${getEquationHint(currentEquationProblem.operation)}`);
          setIsCorrect(false);
          break;
      }

      return;
    }

    const attemptKind = analyzeEquivalentFractionAttempt(
      answer,
      currentEquivalentProblem.fraction,
    );

    switch (attemptKind) {
      case "correct":
        setMessage("Correct! You made an equivalent fraction.");
        markCurrentProblemCorrect();
        break;
      case "same-as-original":
        setHintsUsed((count) => count + 1);
        setMessage("Use a different fraction. Multiply both the numerator and denominator by the same number.");
        setIsCorrect(false);
        break;
      case "invalid":
        setHintsUsed((count) => count + 1);
        setMessage("Enter a fraction in numerator/denominator form, then multiply both parts by the same number.");
        setIsCorrect(false);
        break;
      case "not-equivalent":
        setHintsUsed((count) => count + 1);
        setMessage("Not yet. Multiply both the numerator and denominator by the same number to keep the value equivalent.");
        setIsCorrect(false);
        break;
    }
  }

  function goToNextProblem() {
    const nextProblemIndex = problemIndex + 1;

    if (nextProblemIndex >= activeProblemCount) {
      return;
    }

    setProblemIndex(nextProblemIndex);
    setAnswer("");
    setShowExample(false);
    setMessage(lessonMode === "addition"
      ? getProblemHint(fractionProblems[nextProblemIndex])
      : lessonMode === "simplifying"
        ? getSimplificationHint(simplifyingFractionProblems[nextProblemIndex].fraction)
        : lessonMode === "equivalent"
          ? getEquivalentHint(equivalentFractionProblems[nextProblemIndex].fraction)
          : lessonMode === "percentage"
            ? getPercentageHint(percentageProblems[nextProblemIndex].percent)
            : getEquationHint(equationProblems[nextProblemIndex].operation));
    setIsCorrect(false);
  }

  function selectLesson(nextLessonMode: LessonMode) {
    setView("lesson");
    setLessonMode(nextLessonMode);
    setProblemIndex(0);
    setCompletedCount(0);
    setAttemptCount(0);
    setHintsUsed(0);
    setExamplesUsed(0);
    setAnswer("");
    setIsCorrect(false);
    setIsLessonComplete(false);
    setShowExample(false);
    completionSavedRef.current = false;
    setMessage(nextLessonMode === "addition"
      ? getProblemHint(fractionProblems[0])
      : nextLessonMode === "simplifying"
        ? getSimplificationHint(simplifyingFractionProblems[0].fraction)
        : nextLessonMode === "equivalent"
          ? getEquivalentHint(equivalentFractionProblems[0].fraction)
          : nextLessonMode === "percentage"
            ? getPercentageHint(percentageProblems[0].percent)
            : getEquationHint(equationProblems[0].operation));
  }

  function restartLesson() {
    selectLesson(lessonMode);
  }

  function toggleExample() {
    if (!showExample) {
      setExamplesUsed((count) => count + 1);
    }

    setShowExample((isVisible) => !isVisible);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e8efff,_transparent_32%),#f6f8fc] px-5 py-7 text-[#17233f] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold"><span className="grid size-10 place-items-center rounded-2xl bg-[#315bd6] text-white"><Sparkles size={20}/></span><span>Math Guide</span></div>
            <div className="flex items-center gap-2"><div className="flex rounded-full bg-white p-1 text-sm font-semibold text-[#315bd6] shadow-sm" role="group" aria-label="Choose a fraction lesson"><button onClick={() => selectLesson("addition")} aria-pressed={lessonMode === "addition"} className={`rounded-full px-3 py-2 transition ${lessonMode === "addition" ? "bg-[#315bd6] text-white" : "hover:bg-[#eef3ff]"}`}>Add fractions</button><button onClick={() => selectLesson("simplifying")} aria-pressed={lessonMode === "simplifying"} className={`rounded-full px-3 py-2 transition ${lessonMode === "simplifying" ? "bg-[#315bd6] text-white" : "hover:bg-[#eef3ff]"}`}>Simplify fractions</button><button onClick={() => selectLesson("equivalent")} aria-pressed={lessonMode === "equivalent"} className={`rounded-full px-3 py-2 transition ${lessonMode === "equivalent" ? "bg-[#315bd6] text-white" : "hover:bg-[#eef3ff]"}`}>Equivalent fractions</button><button onClick={() => selectLesson("percentage")} aria-pressed={lessonMode === "percentage"} className={`rounded-full px-3 py-2 transition ${lessonMode === "percentage" ? "bg-[#315bd6] text-white" : "hover:bg-[#eef3ff]"}`}>Percentages</button><button onClick={() => selectLesson("equations")} aria-pressed={lessonMode === "equations"} className={`rounded-full px-3 py-2 transition ${lessonMode === "equations" ? "bg-[#315bd6] text-white" : "hover:bg-[#eef3ff]"}`}>Equations</button></div><button onClick={() => setView(view === "progress" ? "lesson" : "progress")} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#315bd6] shadow-sm transition hover:bg-[#eef3ff]">{view === "progress" ? "Back to lessons" : "Progress"}</button></div>
        </header>

        {view === "progress" ? <section className="rounded-[2rem] border border-[#dce3f0] bg-white p-6 shadow-[0_18px_55px_rgba(35,57,105,.10)] sm:p-10"><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#315bd6]">Progress</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Recent completed lessons</h1><p className="mt-3 text-lg text-[#65708a]">Your saved progress stays in this browser.</p>{completedLessons.length === 0 ? <div className="mt-8 rounded-3xl bg-[#eef3ff] p-6 text-[#52607a]">Complete a lesson to see it here.</div> : <div className="mt-8 space-y-3">{completedLessons.map((lesson, index) => <div key={`${lesson.completedAt}-${index}`} className="flex flex-col gap-3 rounded-2xl border border-[#dce3f0] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{getLessonLabel(lesson.lessonType)}</p><p className="mt-1 text-sm text-[#65708a]">{new Date(lesson.completedAt).toLocaleString()}</p></div><div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-[#52607a] sm:grid-cols-4"><span>Attempt accuracy: <strong className="text-[#17233f]">{lesson.accuracy}%</strong></span><span>Attempts: <strong className="text-[#17233f]">{lesson.attempts}</strong></span><span>Hints: <strong className="text-[#17233f]">{lesson.hintsUsed}</strong></span><span>Examples: <strong className="text-[#17233f]">{lesson.examplesUsed}</strong></span></div></div>)}</div>}</section> : <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-[2rem] border border-[#dce3f0] bg-white p-6 shadow-[0_18px_55px_rgba(35,57,105,.10)] sm:p-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#315bd6]">Practice problem</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{lessonMode === "addition" ? "Let's add fractions." : lessonMode === "simplifying" ? "Let's simplify fractions." : lessonMode === "equivalent" ? "Let's make equivalent fractions." : lessonMode === "percentage" ? "Let's find a percent of a number." : "Let's solve an equation."}</h1>
            <p className="mt-3 text-lg text-[#65708a]">{lessonMode === "addition" ? "We'll work through one step at a time." : lessonMode === "simplifying" ? "We'll find a common factor one step at a time." : lessonMode === "equivalent" ? "We'll multiply both parts by the same number one step at a time." : lessonMode === "percentage" ? "We'll convert the percent, then find the amount one step at a time." : "We'll use inverse operations one step at a time."}</p>
            <div className="my-9 rounded-3xl bg-[#eef3ff] px-8 py-9 text-center text-4xl font-bold text-[#17233f]">{lessonMode === "addition" ? <>{formatFraction(currentAdditionProblem.left)}&nbsp; + &nbsp;{formatFraction(currentAdditionProblem.right)}</> : lessonMode === "simplifying" ? formatFractionAsWritten(currentSimplificationProblem.fraction) : lessonMode === "equivalent" ? <>{formatFractionAsWritten(currentEquivalentProblem.fraction)} = ?</> : lessonMode === "percentage" ? <>{currentPercentageProblem.percent}% of {currentPercentageProblem.number} = ?</> : <>{currentEquationProblem.operation === "add" ? `x + ${currentEquationProblem.value}` : currentEquationProblem.operation === "subtract" ? `x - ${currentEquationProblem.value}` : currentEquationProblem.operation === "multiply" ? `${currentEquationProblem.value}x` : `x / ${currentEquationProblem.value}`} = {currentEquationProblem.result}</>}</div>

            {!isLessonComplete && <>
            <div className="rounded-3xl border border-[#dce3f0] p-5">
              <div className="flex gap-3"><span className="mt-0.5 text-[#e5a314]"><Lightbulb size={23}/></span><div><p className="font-bold">Your next step</p><p className="mt-1 leading-6 text-[#52607a]">{message}</p></div></div>
              <label className="mt-5 block text-sm font-semibold" htmlFor="step">Show what you would do next</label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row"><input id="step" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkStep()} placeholder={lessonMode === "percentage" ? "Example: 20" : lessonMode === "equations" ? "Example: 8" : "Example: numerator/denominator"} className="min-h-12 flex-1 rounded-xl border border-[#cbd5e1] px-4 text-base outline-none focus:ring-2 focus:ring-[#315bd6]"/><button onClick={isCorrect && problemIndex < activeProblemCount - 1 ? goToNextProblem : checkStep} className="min-h-12 rounded-xl bg-[#315bd6] px-5 font-bold text-white transition hover:bg-[#244bbd]">{isCorrect && problemIndex < activeProblemCount - 1 ? "Next problem" : "Check step"} <ArrowRight className="ml-1 inline" size={17}/></button></div>
            </div>

            <button onClick={toggleExample} className="mt-5 flex items-center gap-2 text-sm font-bold text-[#315bd6]"><BookOpen size={18}/>{showExample ? "Hide similar example" : "Show a similar example"}</button>
            {showExample && <div className="mt-3 rounded-2xl bg-[#fff7e5] p-5 text-[#4a3510]">{lessonMode === "addition" ? <><p className="font-bold">Similar example: 1/3 + 1/6</p><p className="mt-2">Change 1/3 to 2/6. Now you can add 2/6 + 1/6.</p></> : lessonMode === "simplifying" ? <><p className="font-bold">Similar example: 18/24</p><p className="mt-2">Find a common factor, then divide the numerator and denominator by it.</p></> : lessonMode === "equivalent" ? <><p className="font-bold">Similar example: 1/3</p><p className="mt-2">Multiply the numerator and denominator by the same number.</p></> : lessonMode === "percentage" ? <><p className="font-bold">Similar example: 25% of 40</p><p className="mt-2">Convert the percent to a decimal or a fraction before multiplying.</p></> : <><p className="font-bold">Similar example: x + 5 = 12</p><p className="mt-2">Undo the operation by using its inverse on both sides.</p></>}</div>}
            </>}
            {isLessonComplete && <div className="rounded-3xl border border-[#dce3f0] bg-[#f8fafc] p-6"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#315bd6]">Lesson complete</p><h2 className="mt-2 text-2xl font-bold">Nice work finishing this lesson.</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-[#65708a]">Attempt accuracy</p><p className="mt-1 text-2xl font-bold">{Math.round((completedCount / attemptCount) * 100)}%</p></div><div><p className="text-sm text-[#65708a]">Problems completed</p><p className="mt-1 text-2xl font-bold">{completedCount}/{activeProblemCount}</p></div><div><p className="text-sm text-[#65708a]">Total attempts</p><p className="mt-1 text-2xl font-bold">{attemptCount}</p></div><div><p className="text-sm text-[#65708a]">Hints used</p><p className="mt-1 text-2xl font-bold">{hintsUsed}</p></div><div><p className="text-sm text-[#65708a]">Examples used</p><p className="mt-1 text-2xl font-bold">{examplesUsed}</p></div></div><button onClick={restartLesson} className="mt-6 min-h-12 rounded-xl bg-[#315bd6] px-5 font-bold text-white transition hover:bg-[#244bbd]">Restart lesson</button></div>}
          </section>

          <aside className="space-y-5">
            <section className="rounded-[2rem] bg-[#17233f] p-6 text-white"><p className="text-sm font-bold uppercase tracking-[.15em] text-[#aebfff]">Learning rule</p><h2 className="mt-3 text-2xl font-bold">We help you think, not copy.</h2><p className="mt-3 leading-6 text-[#d8e0ff]">Math Guide gives hints, examples, and feedback before showing a solution.</p></section>
            <section className="rounded-[2rem] border border-[#dce3f0] bg-white p-6"><p className="font-bold">Today&apos;s progress</p><div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e7ecf5]"><div className="h-full rounded-full bg-[#59b899] transition-all" style={{ width: `${(completedCount / activeProblemCount) * 100}%` }}/></div><p className="mt-3 text-sm text-[#65708a]">{completedCount} of {activeProblemCount} completed</p><div className="mt-6 border-t border-[#e6eaf2] pt-5"><p className="text-sm font-bold">Next up</p><p className="mt-1 text-sm text-[#65708a]">{lessonMode === "addition" ? "Equivalent fractions" : lessonMode === "simplifying" ? "Adding fractions" : lessonMode === "equivalent" ? "Simplifying fractions" : lessonMode === "percentage" ? "One-step equations" : "Adding fractions"}</p></div></section>
          </aside>
        </div>}
      </div>
    </main>
  );
}
