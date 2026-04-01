import { useEffect, useRef } from "react"

type Step = {
  description: string
}

type Props = {
  steps: Step[]
  currentStep: number
}

export default function StepPanel({ steps, currentStep }: Props) {

  const panelRef = useRef<HTMLDivElement>(null)

  // auto scroll to bottom when new step appears
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight
    }
  }, [currentStep])

  return (

    <div
      ref={panelRef}
      className="w-full xl:w-[320px] h-[260px] md:h-[500px] bg-zinc-900 rounded-xl p-4 overflow-y-auto border border-zinc-700"
    >

      <h2 className="text-sm font-semibold text-cyan-400 mb-3">
        Algorithm Steps
      </h2>

      <div className="space-y-2">

        {steps.slice(0, currentStep + 1).map((step, index) => (

          <div
            key={index}
            className={`p-2 rounded-md text-xs
            ${
              index === currentStep
                ? "bg-cyan-500/20 border border-cyan-400"
                : "bg-zinc-800"
            }`}
          >

            <span className="text-cyan-400 font-semibold">
              Step {index + 1}
            </span>

            <p className="text-zinc-300 mt-1">
              {step.description}
            </p>

          </div>

        ))}

      </div>

    </div>
  )
}
