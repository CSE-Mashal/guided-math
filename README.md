# Math Guide

Math Guide is an interactive web app that helps students practice foundational math skills one step at a time.

Instead of immediately showing an answer, the app gives targeted hints, similar examples, and feedback based on the student’s response. It currently supports fraction addition, simplifying fractions, equivalent fractions, percentages, one-step equations, and basic arithmetic.

## Features

* Practice lessons for:

  * Adding fractions
  * Simplifying fractions
  * Creating equivalent fractions
  * Finding a percent of a number
  * Solving one-step equations
* Typed, reusable math engines for deterministic answer checking
* Helpful feedback for common mistakes, such as adding denominators or submitting an unsimplified fraction
* Five-question lesson sessions with:

  * Attempt accuracy
  * Hint and example counts
  * Completion summaries
  * Restart support
* Browser-based progress dashboard using localStorage
* “Try your own question” mode for supported fraction, percentage, equation, and arithmetic questions
* Optional AI tutor support for:

  * A next-step hint
  * A simpler explanation
  * A fully worked, different-number similar example

## AI Safety Approach

Math Guide keeps correctness checking separate from the AI tutor.

* Fraction, percentage, equation, and arithmetic engines determine whether an answer is correct.
* The AI tutor does not decide grades, accuracy, or lesson completion.
* AI hints are designed not to reveal the final answer to the student’s exact question.
* Similar examples must use different numbers and may be fully worked out.
* The OpenAI API key stays server-side in `.env.local` and is not committed to GitHub.
* The tutor API validates supported question formats and applies response safety checks.

## Tech Stack

* React
* TypeScript
* Vite / Vinext
* Tailwind CSS
* localStorage for browser-based lesson history
* OpenAI Responses API for optional tutoring help



## Project Structure

```text
app/
  page.tsx                 Main lesson and progress interface
  api/tutor/route.ts       Server-side AI tutor endpoint

components/
  ai-tutor-help.tsx        AI hint, explanation, and similar-example controls

lib/
  fractions.ts             Fraction operations and answer analysis
  percentages.ts           Percentage operations and answer analysis
  equations.ts             Equation operations and answer analysis
  arithmetic.ts            Arithmetic operations and answer analysis
  custom-question.ts       Supported custom-question parsing and validation
  lesson-progress.ts       Browser progress persistence
  tutor.ts                 Server-side AI tutor request handling
  tutor-schema.ts          AI response validation
```

## Future Improvements

* Fresh generated practice sessions for repeated practice
* More topics, including decimals, ratios, and proportions
* Image-based math question input
* Student accounts and cross-device progress
* Teacher or parent progress views
* Public deployment with stronger production rate limiting

## Author

Mashal Shami
[GitHub](https://github.com/CSE-Mashal)


