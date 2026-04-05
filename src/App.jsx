import { useEffect } from "react";
import { useState } from "react";
import "./App.css";
import { useRef } from "react";

const GRID_SIZE = 20;
const CELL_SIZE = Math.floor(
  Math.min(window.innerWidth, window.innerHeight) * 0.9 / GRID_SIZE
);

export default function App() {
  const [paused, setPaused] = useState(false);
  const [snake, setSnake] = useState([
    { x: 5, y: 5 }
  ]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 20)
  });
  const [score, setScore] = useState(0);
  const speed = Math.max(50, 500 - score * 5); // Increase speed as score increases
  const [gameOver, setGameOver] = useState(false);
  const restartGame = () => {
    clickSoundRef.current?.play();
    setScore(0);
    setSnake([{ x: 5, y: 5 }]);
    setDirection({ x: 1, y: 0 });
    setFood({
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20)
    });
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setStarted(true); 

    audioRef.current.currentTime = 0; // rewind
    audioRef.current.play(); // play again
    };
    const [started, setStarted] = useState(false);
    const startGame = () => {
      clickSoundRef.current?.play();
      setStarted(true);
      setPaused(false);

      if (audioRef.current) {
        audioRef.current.volume = 0.4;
        audioRef.current.play(); //play music
      }
    };
    const audioRef = useRef(null);
    const togglePause = () => {
      // play click sound
        if (clickSoundRef.current) {
          clickSoundRef.current.pause();
          clickSoundRef.current.currentTime = 0;
          clickSoundRef.current.play();
        }
        
      setPaused((p) => {
        if (p) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
        return !p;
      });
    };
    const moveSoundRef = useRef(null);
    const eatSoundRef = useRef(null);
    const hitSoundRef = useRef(null);
    const selfHitSoundRef = useRef(null);
    const clickSoundRef = useRef(null);
    const [highScore, setHighScore] = useState(0);
    const [isHit, setIsHit] = useState(false);
  
  useEffect(() => {
    if (moveSoundRef.current) {
      moveSoundRef.current.volume = 0.5;
    }
  }, []);

  useEffect(() => {
    if (eatSoundRef.current) {
      eatSoundRef.current.volume = 0.7;
    }
  }, []);

  useEffect(() => {
    if (hitSoundRef.current) {
      hitSoundRef.current.volume = 0.6;
    }
  }, []);

  useEffect(() => {
    if (selfHitSoundRef.current) {
      selfHitSoundRef.current.volume = 0.6;
    }
  }, []);

  useEffect(() => {
    if (clickSoundRef.current) {
      clickSoundRef.current.volume = 0.4;
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("highScore");
    if (saved) {
      setHighScore(Number(saved));
    }
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("highScore", score);
    }
  }, [score, highScore]);

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) setDirection({ x: 1, y: 0 });
        else setDirection({ x: -1, y: 0 });
      } else {
        if (dy > 0) setDirection({ x: 0, y: 1 });
        else setDirection({ x: 0, y: -1 });
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault(); // stops page scroll
        togglePause();  //Space = pause / play
        return;
      }

      if (paused) return;

      switch (e.key) {
        case "ArrowUp":
          setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [paused, togglePause]);

  useEffect(()=> {
    if (paused || gameOver || !started) return;

    const gameLoop = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y
        };

        // play movement sound
        if (moveSoundRef.current) {
          moveSoundRef.current.pause();
          moveSoundRef.current.currentTime = 0; //reset sound
          moveSoundRef.current.play();
        }

        //Check wall collision 
          if (
            newHead.x < 0 ||
            newHead.x >= GRID_SIZE ||
            newHead.y < 0 ||
            newHead.y >= GRID_SIZE
          ) {

            // Hit wall sound
            if (hitSoundRef.current) {
              hitSoundRef.current.pause();
              hitSoundRef.current.currentTime = 0;
              hitSoundRef.current.play();
            }

            setPaused(true);
            audioRef.current.pause();  // stop music
            setIsHit(true);
            setGameOver(true);
            // Delay everything
            setTimeout(() => {
              setIsHit(false); //reset
              setSnake([{ x: 5, y: 5 }]);
              setDirection({ x: 1, y: 0 });
              setFood({
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE)
            });
            }, 120);
            return prev; // Don't move snake, just end game 
          }

          //Check self-collision
           const collision = prev.some(
             (segment) => segment.x === newHead.x && segment.y === newHead.y
           );

           if (collision) {

            // self-Hit sound
            if (selfHitSoundRef.current) {
              selfHitSoundRef.current.pause();
              selfHitSoundRef.current.currentTime = 0;
              selfHitSoundRef.current.play();
            }
               setPaused(true);
               audioRef.current.pause();  // stop music
               setIsHit(true);
               setGameOver(true);

            setTimeout(() => {
              setIsHit(false); //reset
              setSnake([{ x: 5, y: 5 }]);
              setDirection({ x: 1, y: 0 });
              setFood({
                x: Math.floor(Math.random() * GRID_SIZE), 
                y: Math.floor(Math.random() * GRID_SIZE)
            });
          }, 120);
            return prev;  // Don't move snake, just end game 
          }

          //check if food is eaten
          if (newHead.x === food.x && newHead.y === food.y) {
            // Eat sound
            if (eatSoundRef.current) {
              eatSoundRef.current.pause();
              eatSoundRef.current.currentTime = 0;
              eatSoundRef.current.play();
            }
              setScore((s) => s + 1); // increase score
            // Grow snake by adding food to tail
            setFood({
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE)
            });
            return [newHead, ...prev]; //Grow snake
          } else {
            return [newHead, ...prev.slice(0, -1)]; //Normal move
          }
      });
    }, speed)

    return () => clearInterval(gameLoop);
  }, [direction, paused, gameOver, started, speed]);

  return (
    <div>
    <audio ref={audioRef} src="/all_my_love-snake-melody-434495.mp3" loop/>
    <audio ref={moveSoundRef} src="/mixkit-martial-arts-fast-punch-2047.wav" />
    <audio ref={eatSoundRef} src="/mixkit-extra-bonus-in-a-video-game-2045.wav" />
    <audio ref={hitSoundRef} src="/mixkit-arcade-mechanical-bling-210.wav" />
    <audio ref={selfHitSoundRef} src="/mixkit-game-blood-pop-slide-2363.wav" />
    <audio ref={clickSoundRef} src="/mixkit-retro-arcade-casino-notification-211.wav" />
      {!started && (
        <div className="game-over">
          <h2>🐍 Snake Game</h2>
          <button onClick={startGame}>Start Game</button>
          </div>
      )}
      {gameOver && (
      <div className="game-over">
        <h2>💀Game Over</h2>
        <p>Score: {score}</p>
        <p>High Score: {highScore}</p>
        <button onClick={restartGame}>Restart</button>
      </div>
    )}
    {/* Game UI (Only when started) */}
    {started && (
      <>
    {!gameOver && (
      <div className="scoreboard">
        <div className="scorebox">
      <h3>Score: {score}</h3>
      <h3>High Score: {highScore}</h3>
      </div>
      <div className="controls">
    <button onClick={() => audioRef.current.muted = !audioRef.current.muted}>🔊</button>
    <button
      onClick={togglePause}
      style={{ marginBottom: "10px" }}
    >
      {paused ? "▶" : "⏸"}
    </button>
    </div>
    </div>
    )}

    <div className="board"
      style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE
      }}
      >
      {snake.map((seg, i) => (
        <div
          key={i}
          className={`snake ${i === 0 ? "head" : ""} ${isHit ? "hit" : ""}`}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: seg.x * CELL_SIZE,
            top: seg.y * CELL_SIZE,
            backgroundColor: 
              i === 0 && isHit ? "red" : "limegreen" //head turns red when hit
          }}
          />
      ))}

    <div
      className="food"
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        left: food.x * CELL_SIZE,
        top: food.y * CELL_SIZE
      }}
      />
      </div>
    </>
    )}
    </div>
  );
}