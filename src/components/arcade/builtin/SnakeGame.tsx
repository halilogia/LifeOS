import { useState, useEffect, useRef } from "preact/hooks";

interface SnakeGameProps {
  onScoreUpdate: (score: number) => void;
  highScore: number;
  t: Record<string, string>;
}

interface Point {
  x: number;
  y: number;
}

export function SnakeGame({ onScoreUpdate, highScore, t }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Game state refs for animation loop
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const foodRef = useRef<Point>({ x: 15, y: 15 });
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });
  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);

  const GRID_SIZE = 20;
  const CANVAS_SIZE = 400;
  const CELL_COUNT = CANVAS_SIZE / GRID_SIZE;

  const spawnFood = (snake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * CELL_COUNT),
        y: Math.floor(Math.random() * CELL_COUNT),
      };
      const collision = snake.some((s) => s.x === newFood.x && s.y === newFood.y);
      if (!collision) break;
    }
    return newFood;
  };

  const startGame = () => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    scoreRef.current = 0;
    foodRef.current = spawnFood(snakeRef.current);
    isGameOverRef.current = false;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const dir = dirRef.current;
      if ((e.key === "ArrowUp" || e.key === "w" || e.key === "W") && dir.y !== 1) {
        nextDirRef.current = { x: 0, y: -1 };
      } else if ((e.key === "ArrowDown" || e.key === "s" || e.key === "S") && dir.y !== -1) {
        nextDirRef.current = { x: 0, y: 1 };
      } else if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && dir.x !== 1) {
        nextDirRef.current = { x: -1, y: 0 };
      } else if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && dir.x !== -1) {
        nextDirRef.current = { x: 1, y: 0 };
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    let intervalId: NodeJS.Timeout;

    const gameLoop = () => {
      if (isGameOverRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Update Direction
      dirRef.current = nextDirRef.current;
      const head = { ...snakeRef.current[0] };
      head.x += dirRef.current.x;
      head.y += dirRef.current.y;

      // Wall Collision
      if (head.x < 0 || head.x >= CELL_COUNT || head.y < 0 || head.y >= CELL_COUNT) {
        isGameOverRef.current = true;
        setGameOver(true);
        onScoreUpdate(scoreRef.current);
        return;
      }

      // Self Collision
      if (snakeRef.current.some((s) => s.x === head.x && s.y === head.y)) {
        isGameOverRef.current = true;
        setGameOver(true);
        onScoreUpdate(scoreRef.current);
        return;
      }

      const newSnake = [head, ...snakeRef.current];

      // Check Food
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        scoreRef.current += 10;
        setScore(scoreRef.current);
        foodRef.current = spawnFood(newSnake);
      } else {
        newSnake.pop();
      }

      snakeRef.current = newSnake;

      // Draw
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Grid Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
        ctx.stroke();
      }

      // Draw Food (Neon Pulse)
      ctx.fillStyle = "#ef4444";
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(
        foodRef.current.x * GRID_SIZE + GRID_SIZE / 2,
        foodRef.current.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Draw Snake
      snakeRef.current.forEach((segment, index) => {
        ctx.shadowColor = "#8b5cf6";
        ctx.shadowBlur = index === 0 ? 12 : 4;
        ctx.fillStyle = index === 0 ? "#a78bfa" : "#8b5cf6";
        ctx.fillRect(
          segment.x * GRID_SIZE + 1,
          segment.y * GRID_SIZE + 1,
          GRID_SIZE - 2,
          GRID_SIZE - 2,
        );
      });
      ctx.shadowBlur = 0; // reset
    };

    intervalId = setInterval(gameLoop, 100);
    return () => clearInterval(intervalId);
  }, [gameStarted, gameOver]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "400px", color: "var(--text-secondary)" }}>
        <div>{t.arcade_score_label_short} <strong style={{ color: "#a78bfa" }}>{score}</strong></div>
        <div>{t.arcade_high_score_label} <strong style={{ color: "var(--success)" }}>{Math.max(highScore, score)}</strong></div>
      </div>

      <div style={{ position: "relative", width: "400px", height: "400px", borderRadius: "12px", overflow: "hidden", border: "2px solid var(--card-border)" }}>
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} style={{ display: "block" }} />

        {!gameStarted && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <h3 style={{ color: "#fff" }}>{t.arcade_snake_title}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", padding: "0 20px" }}>
              {t.arcade_snake_controls}
            </p>
            <button onClick={startGame} className="arcade-btn-primary">
              {t.arcade_start_game}
            </button>
          </div>
        )}

        {gameOver && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <h3 style={{ color: "#ef4444" }}>{t.arcade_game_over}</h3>
            <p style={{ color: "#fff" }}>{t.arcade_score_label_short} {score}</p>
            <button onClick={startGame} className="arcade-btn-primary">
              {t.arcade_restart}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
