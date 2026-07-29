import { useState, useEffect, useRef } from "preact/hooks";

interface KnightRunnerProps {
  onScoreUpdate: (score: number) => void;
  highScore: number;
}

export function KnightRunner({ onScoreUpdate, highScore }: KnightRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);

  // Player state
  const knightRef = useRef({
    x: 50,
    y: 220,
    width: 32,
    height: 48,
    velocityY: 0,
    isJumping: false,
    gravity: 0.8,
    jumpPower: -13,
  });

  // Obstacles & Collectibles
  const obstaclesRef = useRef<{ x: number; width: number; height: number }[]>([]);
  const coinsRef = useRef<{ x: number; y: number; collected: boolean }[]>([]);
  const frameRef = useRef(0);

  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 300;
  const GROUND_Y = 250;

  const jump = () => {
    if (!knightRef.current.isJumping && !isGameOverRef.current) {
      knightRef.current.velocityY = knightRef.current.jumpPower;
      knightRef.current.isJumping = true;
    }
  };

  const startGame = () => {
    knightRef.current = {
      x: 50,
      y: GROUND_Y - 48,
      width: 32,
      height: 48,
      velocityY: 0,
      isJumping: false,
      gravity: 0.8,
      jumpPower: -13,
    };
    obstaclesRef.current = [];
    coinsRef.current = [];
    scoreRef.current = 0;
    frameRef.current = 0;
    isGameOverRef.current = false;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        if (!gameStarted || gameOver) {
          startGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    let animId: number;

    const updateAndRender = () => {
      if (isGameOverRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      frameRef.current += 1;
      scoreRef.current += 1;
      setScore(Math.floor(scoreRef.current / 5));

      // Physics
      const knight = knightRef.current;
      knight.velocityY += knight.gravity;
      knight.y += knight.velocityY;

      if (knight.y >= GROUND_Y - knight.height) {
        knight.y = GROUND_Y - knight.height;
        knight.velocityY = 0;
        knight.isJumping = false;
      }

      // Spawn Obstacles
      if (frameRef.current % 120 === 0) {
        obstaclesRef.current.push({
          x: CANVAS_WIDTH + 20,
          width: 24,
          height: 36,
        });
      }

      // Spawn Coins
      if (frameRef.current % 90 === 0) {
        coinsRef.current.push({
          x: CANVAS_WIDTH + 30,
          y: GROUND_Y - 80 - Math.random() * 40,
          collected: false,
        });
      }

      // Update Obstacles
      obstaclesRef.current.forEach((obs) => {
        obs.x -= 4;
      });
      obstaclesRef.current = obstaclesRef.current.filter((obs) => obs.x > -50);

      // Update Coins
      coinsRef.current.forEach((c) => {
        c.x -= 4;
      });
      coinsRef.current = coinsRef.current.filter((c) => c.x > -50);

      // Collisions
      obstaclesRef.current.forEach((obs) => {
        if (
          knight.x < obs.x + obs.width &&
          knight.x + knight.width > obs.x &&
          knight.y < GROUND_Y &&
          knight.y + knight.height > GROUND_Y - obs.height
        ) {
          isGameOverRef.current = true;
          setGameOver(true);
          onScoreUpdate(Math.floor(scoreRef.current / 5));
        }
      });

      // Coin collection
      coinsRef.current.forEach((coin) => {
        if (
          !coin.collected &&
          Math.abs(knight.x + knight.width / 2 - coin.x) < 24 &&
          Math.abs(knight.y + knight.height / 2 - coin.y) < 24
        ) {
          coin.collected = true;
          scoreRef.current += 50;
        }
      });

      // Clear & Background
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Ground
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
      ctx.fillStyle = "#8b5cf6";
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 4);

      // Draw Coins
      coinsRef.current.forEach((coin) => {
        if (!coin.collected) {
          ctx.fillStyle = "#f59e0b";
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Obstacles (Red Spikes)
      obstaclesRef.current.forEach((obs) => {
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(obs.x, GROUND_Y);
        ctx.lineTo(obs.x + obs.width / 2, GROUND_Y - obs.height);
        ctx.lineTo(obs.x + obs.width, GROUND_Y);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Knight (Blue/Purple Hero Body & Sword)
      ctx.fillStyle = "#a78bfa";
      ctx.shadowColor = "#a78bfa";
      ctx.shadowBlur = 10;
      ctx.fillRect(knight.x, knight.y, knight.width, knight.height);

      // Visor
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(knight.x + 18, knight.y + 8, 10, 6);

      // Sword
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(knight.x + 28, knight.y + 16, 12, 4);
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(updateAndRender);
    };

    animId = requestAnimationFrame(updateAndRender);
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, gameOver]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "480px", color: "var(--text-secondary)" }}>
        <div>Skor: <strong style={{ color: "#a78bfa" }}>{score}</strong></div>
        <div>En Yüksek: <strong style={{ color: "var(--success)" }}>{Math.max(highScore, score)}</strong></div>
      </div>

      <div
        onClick={jump}
        style={{
          position: "relative",
          width: "480px",
          height: "300px",
          borderRadius: "12px",
          overflow: "hidden",
          border: "2px solid var(--card-border)",
          cursor: "pointer",
        }}
      >
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ display: "block" }} />

        {!gameStarted && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <h3 style={{ color: "#fff" }}>2D Knight Runner</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", padding: "0 20px" }}>
              Zıplamak için Boşluk (Space), Yukarı Tuşu veya Tıkla!
            </p>
            <button onClick={startGame} className="arcade-btn-primary">
              Maceraya Başla
            </button>
          </div>
        )}

        {gameOver && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <h3 style={{ color: "#ef4444" }}>Şövalye Düştü!</h3>
            <p style={{ color: "#fff" }}>Skor: {score}</p>
            <button onClick={startGame} className="arcade-btn-primary">
              Tekrar Dene
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
