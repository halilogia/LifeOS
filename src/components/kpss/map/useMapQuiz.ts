/**
 * useMapQuiz.ts
 * KPSS Harita Sınavı / Konum Bulma Oyunu durum yönetimi hook'u.
 */

import { useState, useCallback, useEffect } from "preact/hooks";
import {
  TOPIC_PINS,
  TurkeyMapTopic,
  GeoPin,
} from "@/domain/constants/TurkeyGeographyData.js";
import {
  playCorrectSound,
  playWrongSound,
  playVictorySound,
} from "./mapAudioUtils.js";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface MapQuizState {
  topic: TurkeyMapTopic;
  targets: GeoPin[];
  currentIndex: number;
  currentTarget: GeoPin | null;
  score: number;
  wrongCount: number;
  skippedCount: number;
  streak: number;
  bestStreak: number;
  isCompleted: boolean;
  solvedPinNames: Set<string>;
  showHint: boolean;
  wrongAttemptPin: GeoPin | null;
  lastFeedback: { type: "correct" | "wrong"; text: string } | null;
}

export interface MapQuizActions {
  handleGuess: (clickedPin: GeoPin) => void;
  handleSkip: () => void;
  handleHint: () => void;
  handleRestart: () => void;
  setTopic: (topic: TurkeyMapTopic) => void;
}

export function useMapQuiz(initialTopic: TurkeyMapTopic = "kivrim") {
  const [topic, setTopicState] = useState<TurkeyMapTopic>(initialTopic);
  const [targets, setTargets] = useState<GeoPin[]>(() =>
    shuffleArray(TOPIC_PINS[initialTopic] || TOPIC_PINS.kivrim),
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [skippedCount, setSkippedCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [solvedPinNames, setSolvedPinNames] = useState<Set<string>>(new Set());
  const [showHint, setShowHint] = useState<boolean>(false);
  const [wrongAttemptPin, setWrongAttemptPin] = useState<GeoPin | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{
    type: "correct" | "wrong";
    text: string;
  } | null>(null);

  // Konu değiştiğinde yeni rastgele hedef listesi oluştur
  const initTopic = useCallback((newTopic: TurkeyMapTopic) => {
    const rawPins = TOPIC_PINS[newTopic] || TOPIC_PINS.kivrim;
    setTopicState(newTopic);
    setTargets(shuffleArray(rawPins));
    setCurrentIndex(0);
    setScore(0);
    setWrongCount(0);
    setSkippedCount(0);
    setStreak(0);
    setBestStreak(0);
    setIsCompleted(false);
    setSolvedPinNames(new Set());
    setShowHint(false);
    setWrongAttemptPin(null);
    setLastFeedback(null);
  }, []);

  const handleRestart = useCallback(() => {
    initTopic(topic);
  }, [initTopic, topic]);

  const currentTarget =
    currentIndex < targets.length ? targets[currentIndex] : null;

  const handleGuess = useCallback(
    (clickedPin: GeoPin) => {
      if (isCompleted || !currentTarget) {
        return;
      }

      // Aynı isimde pin tespiti (veya koordinat çakışması)
      const isCorrect =
        clickedPin.name.toLowerCase() === currentTarget.name.toLowerCase() ||
        (Math.abs(clickedPin.x - currentTarget.x) < 2 &&
          Math.abs(clickedPin.y - currentTarget.y) < 2);

      if (isCorrect) {
        playCorrectSound();
        const nextScore = score + 1;
        const nextStreak = streak + 1;
        const nextBest = Math.max(bestStreak, nextStreak);

        setScore(nextScore);
        setStreak(nextStreak);
        setBestStreak(nextBest);
        setSolvedPinNames((prev) => new Set(prev).add(currentTarget.name));
        setShowHint(false);
        setWrongAttemptPin(null);
        setLastFeedback({
          type: "correct",
          text: `Tebrikler! ${currentTarget.name} doğru konum.`,
        });

        const nextIdx = currentIndex + 1;
        if (nextIdx >= targets.length) {
          setIsCompleted(true);
          playVictorySound();
        } else {
          setCurrentIndex(nextIdx);
        }
      } else {
        playWrongSound();
        setStreak(0);
        setWrongCount((prev) => prev + 1);
        setWrongAttemptPin(clickedPin);
        setLastFeedback({
          type: "wrong",
          text: `Yanlış! Tıkladığınız konum: ${clickedPin.name}`,
        });
      }
    },
    [
      isCompleted,
      currentTarget,
      score,
      streak,
      bestStreak,
      currentIndex,
      targets.length,
    ],
  );

  const handleSkip = useCallback(() => {
    if (isCompleted || !currentTarget) {
      return;
    }
    setSkippedCount((prev) => prev + 1);
    setStreak(0);
    setShowHint(false);
    setWrongAttemptPin(null);
    setLastFeedback({
      type: "wrong",
      text: `${currentTarget.name} pas geçildi.`,
    });

    const nextIdx = currentIndex + 1;
    if (nextIdx >= targets.length) {
      setIsCompleted(true);
      playVictorySound();
    } else {
      setCurrentIndex(nextIdx);
    }
  }, [isCompleted, currentTarget, currentIndex, targets.length]);

  const handleHint = useCallback(() => {
    setShowHint(true);
  }, []);

  // Geri bildirim mesajını 2.5 sn sonra temizle
  useEffect(() => {
    if (!lastFeedback) {
      return;
    }
    const timer = setTimeout(() => {
      setLastFeedback(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [lastFeedback]);

  return {
    state: {
      topic,
      targets,
      currentIndex,
      currentTarget,
      score,
      wrongCount,
      skippedCount,
      streak,
      bestStreak,
      isCompleted,
      solvedPinNames,
      showHint,
      wrongAttemptPin,
      lastFeedback,
    },
    actions: {
      handleGuess,
      handleSkip,
      handleHint,
      handleRestart,
      setTopic: initTopic,
    },
  };
}
