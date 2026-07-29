import { useState, useEffect, useRef } from "preact/hooks";

interface SpaceShooterProps {
  onScoreUpdate: (score: number) => void;
  highScore: number;
}

export function SpaceShooter({ onScoreUpdate, highScore }: SpaceShooterProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);

  // Player Ship
  const playerRef = useRef({
    x: 220,
    y: 350,
    width: 32,
    height: 32,
    speed: 6,
  });

  const bulletsRef = useRef<{ x: number; y: number }[]>([]);
  const enemiesRef = useRef<{ x: number; y: number; width: number; height: number; speed: number }[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lastShotRef = useRef(0);
  const frameRef = useRef(0);

  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 400;

  const startGame = () => {
    playerRef.current = {
      x: CANVAS_WIDTH / 2 - 16,
      y: CANVAS_HEIGHT - 50,
      width: 32,
      height: 32,
      speed: 6,
    };
    bulletsRef.current = [];
    enemiesRef.current = [];
    keysRef.current = {};
    scoreRef.current = 0;
    frameRef.current = 0;
    isGameOverRef.current = false;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    let animId: number;

    const gameLoop = () => {
      if (isGameOverRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      frameRef.current += 1;
      const player = playerRef.current;

      // Handle Input
      if (keysRef.current["ArrowLeft"] || keysRef.current["a"] || keysRef.current["A"]) {
        player.x = Math.max(0, player.x - player.speed);
      }
      if (keysRef.current["ArrowRight"] || keysRef.current["d"] || keysRef.current["D"]) {
        player.x = Math.min(CANVAS_WIDTH - player.width, player.x + player.speed);
      }

      // Shoot Bullets
      const now = Date.now();
      if ((keysRef.current[" "] || keysRef.current["ArrowUp"] || keysRef.current["w"] || keysRef.current["W"]) && now - lastShotRef.current > 180) {
        bulletsRef.current.push({
          x: player.x + player.width / 2 - 2,
          y: player.y - 8,
        });
        lastShotRef.current = now;
      }

      // Spawn Enemies
      if (frameRef.current % 40 === 0) {
        enemiesRef.current.push({
          x: Math.random() * (CANVAS_WIDTH - 30),
          y: -30,
          width: 28,
          height: 28,
          speed: 2 + Math.random() * 2,
        });
      }

      // Update Bullets
      bulletsRef.current.forEach((b) => {
        b.y -= 8;
      });
      bulletsRef.current = bulletsRef.current.filter((b) => b.y > -10);

      // Update Enemies
      enemiesRef.current.forEach((e) => {
        e.y += e.speed;
      });

      // Enemy / Player Collision
      enemiesRef.current.forEach((e) => {
        if (
          player.x < e.x + e.width &&
          player.x + player.width > e.x &&
          player.y < e.y + e.height &&
          player.y + player.height > e.y
        ) {
          isGameOverRef.current = true;
          setGameOver(true);
          onScoreUpdate(scoreRef.current);
        }

        // Enemy reached bottom
        if (e.y > CANVAS_HEIGHT) {
          isGameOverRef.current = true;
          setGameOver(true);
          onScoreUpdate(scoreRef.current);
        }
      });

      // Bullet / Enemy Collision
      bulletsRef.current.forEach((b) => {
        enemiesRef.current.forEach((e) => {
          if (
            b.x < e.x + e.width &&
            b.x + 4 > e.x &&
            b.y < e.y + e.height &&
            b.y + 10 > e.y
          ) {
            b.y = -999;
            e.y = 9999;
            scoreRef.current += 100;
            setScore(scoreRef.current);
          }
        });
      });

      enemiesRef.current = enemiesRef.current.filter((e) => e.y < CANVAS_HEIGHT + 50);

      // Render Clear
      ctx.fillStyle = "#050811";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Render Stars Background
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let i = 0; i < 20; i++) {
        const starX = (i * 37 + frameRef.current) % CANVAS_WIDTH;
        const starY = (i * 53 + frameRef.current * 2) % CANVAS_HEIGHT;
        ctx.fillRect(starX, starY, 2, 2);
      }

      // Render Bullets (Cyan Laser)
      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;
      bulletsRef.current.forEach((b) => {
        ctx.fillRect(b.x, b.y, 4, 12);
      });

      // Render Enemies (Red Alien Ships)
      ctx.fillStyle = "#f43f5e";
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 10;
      enemiesRef.current.forEach((e) => {
        ctx.beginPath();
        ctx.moveTo(e.x + e.width / 2, e.y + e.height);
        ctx.lineTo(e.x, e.y);
        ctx.lineTo(e.x + e.width, e.y);
        ctx.closePath();
        ctx.fill();
      });

      // Render Player (Purple Falcon)
      ctx.fillStyle = "#a855f7";
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(player.x + player.width / 2, player.y);
      ctx.lineTo(player.x, player.y + player.height);
      ctx.lineTo(player.x + player.width, player.y + player.height);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, gameOver]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "480px", color: "var(--text-secondary)" }}>
        <div>Skor: <strong style={{ color: "#a78bfa" }}>{score}</strong></div>
        <div>En Yüksek: <strong style={{ color: "var(--success)" }}>{Math.max(highScore, score)}</strong></div>
      </div>

      <div style={{ position: "relative", width: "480px", height: "400px", borderRadius: "12px", overflow: "hidden", border: "2px solid var(--card-border)" }}>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ display: "block" }} />

        {!gameStarted && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <h3 style={{ color: "#fff" }}>Galaxy Defender 2D</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", padding: "0 20px" }}>
              Sol/Sağ Ok Tuşları veya A/D ile hareket et. Boşluk (Space) tuşu ile ateş et!
            </p>
            <button onClick={startGame} className="arcade-btn-primary">
              Savaşa Katıl
            </button>
          </div>
        )}

        {gameOver && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <h3 style={{ color: "#ef4444" }}>Uzay Gemisi Yok Oldu!</h3>
            <p style={{ color: "#fff" }}>Skor: {score}</p>
            <button onClick={startGame} className="arcade-btn-primary">
              Yeniden Başla
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
