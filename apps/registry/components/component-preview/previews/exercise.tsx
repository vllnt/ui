"use client";

import { Exercise } from "@vllnt/ui";

export default function ExercisePreview() {
  return (
    <Exercise
      difficulty="easy"
      hint="Use the useState hook"
      solution={
        <pre className="text-xs">const [count, setCount] = useState(0)</pre>
      }
      title="Create a Counter"
    >
      <p>Create a component that displays and increments a number.</p>
    </Exercise>
  );
}
