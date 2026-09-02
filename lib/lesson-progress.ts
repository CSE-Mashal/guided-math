export type CompletedLesson = {
  lessonType: string;
  accuracy: number;
  attempts: number;
  hintsUsed: number;
  examplesUsed: number;
  completedAt: string;
};

const storageKey = "math-guide-completed-lessons";
const maxSavedLessons = 10;

function isCompletedLesson(value: unknown): value is CompletedLesson {
  if (!value || typeof value !== "object") {
    return false;
  }

  const lesson = value as Record<string, unknown>;

  return (
    typeof lesson.lessonType === "string" &&
    typeof lesson.accuracy === "number" &&
    Number.isFinite(lesson.accuracy) &&
    typeof lesson.attempts === "number" &&
    Number.isFinite(lesson.attempts) &&
    typeof lesson.hintsUsed === "number" &&
    Number.isFinite(lesson.hintsUsed) &&
    typeof lesson.examplesUsed === "number" &&
    Number.isFinite(lesson.examplesUsed) &&
    typeof lesson.completedAt === "string"
  );
}

export function loadCompletedLessons(): CompletedLesson[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedLessons = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");

    if (!Array.isArray(storedLessons)) {
      return [];
    }

    return storedLessons.filter(isCompletedLesson).slice(0, maxSavedLessons);
  } catch {
    return [];
  }
}

export function saveCompletedLesson(lesson: CompletedLesson): CompletedLesson[] {
  const lessons = [lesson, ...loadCompletedLessons()].slice(0, maxSavedLessons);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(lessons));
    } catch {
      return lessons;
    }
  }

  return lessons;
}
