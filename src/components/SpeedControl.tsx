interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const SpeedControl = ({ speed, onSpeedChange }: SpeedControlProps) => {
  const speeds = [
    { label: "0.5x", value: 2 },
    { label: "1x", value: 1 },
    { label: "2x", value: 0.5 },
    { label: "4x", value: 0.25 },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Speed:</span>
      {speeds.map((s) => (
        <button
          key={s.label}
          onClick={() => onSpeedChange(s.value)}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            speed === s.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};

export default SpeedControl;
