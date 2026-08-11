/**
 * detoxTypes.ts
 * Type definitions and default constant configurations for anti-doomscrolling engine.
 */

export interface DistractionSettings {
  ytShortsBlock: boolean;
  ytFeedBlock: boolean;
  ytCommentsBlock: boolean;
  igReelsBlock: boolean;
  igExploreBlock: boolean;
  igFeedBlock: boolean;
  fbReelsBlock: boolean;
  fbFeedBlock: boolean;
  ttFeedBlock: boolean;
  xFeedBlock: boolean;
  xExploreBlock: boolean;
}

export const DEFAULT_DISTRACTION_SETTINGS: DistractionSettings = {
  ytShortsBlock: true,
  ytFeedBlock: true,
  ytCommentsBlock: false,
  igReelsBlock: true,
  igExploreBlock: false,
  igFeedBlock: false,
  fbReelsBlock: true,
  fbFeedBlock: false,
  ttFeedBlock: true,
  xFeedBlock: false,
  xExploreBlock: false,
};

export const DEFAULT_QUOTES = [
  {
    text: "We must overcome the notion that we must be regular. It robs you of the chance to be extraordinary and leads you to the mediocre.",
    author: "Uta Hagen",
  },
  {
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
  },
  {
    text: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca",
  },
  {
    text: "Focus is a muscle. The more you practice saying no to distractions, the stronger it gets.",
    author: "Life OS Mindset",
  },
];
