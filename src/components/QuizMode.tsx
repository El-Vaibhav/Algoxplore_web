import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";
import type { QuizQuestion } from "@/lib/quizGenerators";

interface QuizModeProps {
  /** Whether quiz mode is active */
  active: boolean;
  /** Toggle quiz mode */
  onToggle: () => void;
  /** Current question (null = no question available) */
  question: QuizQuestion | null;
  /** Called when user answers; passes whether correct */
  onAnswer: (correct: boolean) => void;
  /** Accent color class e.g. "sorting", "graph" */
  accent: string;
  /** Score */
  score: number;
  total: number;
}

export function QuizToggle({ active, onToggle, accent }: { active: boolean; onToggle: () => void; accent: string }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all font-medium ${
        active
          ? `bg-${accent}/20 text-${accent} border border-${accent}/40 shadow-sm shadow-${accent}/10`
          : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-transparent"
      }`}
    >
      <Brain className="w-3.5 h-3.5" />
      Quiz {active ? "ON" : "OFF"}
    </button>
  );
}

export function QuizScoreBadge({ score, total, accent }: { score: number; total: number; accent: string }) {
  if (total === 0) return null;
  const pct = Math.round((score / total) * 100);
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full bg-${accent}/10 text-${accent} font-mono`}>
      <Trophy className="w-3 h-3" />
      {score}/{total} ({pct}%)
    </div>
  );
}

export function QuizCard({ question, onAnswer, accent }: {
  question: QuizQuestion;
  onAnswer: (correct: boolean) => void;
  accent: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const correct = idx === question.correctIndex;
    setTimeout(() => {
      onAnswer(correct);
      setSelected(null);
      setRevealed(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl border border-border bg-card p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Brain className={`w-4 h-4 text-${accent}`} />
        <h4 className="text-sm font-semibold text-foreground">Quiz</h4>
      </div>
      <p className="text-xs text-foreground font-medium">{question.question}</p>
      <div className="space-y-1.5">
        {question.options.map((opt, idx) => {
          let optClass = "bg-secondary/50 text-foreground hover:bg-secondary border border-transparent cursor-pointer";
          if (revealed) {
            if (idx === question.correctIndex) {
              optClass = "bg-success/15 text-success border border-success/30";
            } else if (idx === selected) {
              optClass = "bg-destructive/15 text-destructive border border-destructive/30";
            } else {
              optClass = "bg-secondary/30 text-muted-foreground border border-transparent opacity-50";
            }
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={revealed}
              className={`w-full text-left px-3 py-2 text-[11px] rounded-lg transition-all ${optClass} flex items-center gap-2`}
            >
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                revealed && idx === question.correctIndex ? "border-success bg-success/20 text-success" :
                revealed && idx === selected ? "border-destructive bg-destructive/20 text-destructive" :
                "border-border text-muted-foreground"
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="truncate">{opt}</span>
              {revealed && idx === question.correctIndex && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-success flex-shrink-0" />}
              {revealed && idx === selected && idx !== question.correctIndex && <XCircle className="w-3.5 h-3.5 ml-auto text-destructive flex-shrink-0" />}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {revealed && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-[10px] text-muted-foreground bg-secondary/30 rounded-lg p-2 leading-relaxed"
          >
            {question.explanation}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function QuizSummary({ score, total, onRetry, accent }: {
  score: number; total: number; onRetry: () => void; accent: string;
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-border bg-card p-5 space-y-3 text-center"
    >
      <Trophy className={`w-8 h-8 mx-auto text-${accent}`} />
      <div>
        <div className="text-2xl font-bold text-foreground">{pct}%</div>
        <div className="text-xs text-muted-foreground">{score} out of {total} correct</div>
      </div>
      <div className={`text-sm font-medium ${pct >= 80 ? "text-success" : pct >= 50 ? "text-warning" : "text-destructive"}`}>
        {pct >= 80 ? "Excellent! 🎉" : pct >= 50 ? "Good effort! 💪" : "Keep practicing! 📚"}
      </div>
      <button
        onClick={onRetry}
        className={`flex items-center gap-1.5 mx-auto px-4 py-2 text-xs rounded-lg bg-${accent}/15 text-${accent} hover:bg-${accent}/25 transition-colors`}
      >
        <RotateCcw className="w-3.5 h-3.5" /> Try Again
      </button>
    </motion.div>
  );
}
