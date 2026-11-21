"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DeckId = "web" | "ai";
type Recall = "remembered" | "practice";

type Card = {
  id: string;
  topic: string;
  question: string;
  answer: string;
};

type Deck = {
  title: string;
  description: string;
  icon: string;
  cards: Card[];
};

const decks: Record<DeckId, Deck> = {
  web: {
    title: "Web development",
    description: "The building blocks of the web",
    icon: "</>",
    cards: [
      {
        id: "html",
        topic: "HTML",
        question: "What is HTML used for?",
        answer:
          "HTML gives a web page its structure and meaning, using elements like headings, links, images, and forms.",
      },
      {
        id: "css",
        topic: "CSS",
        question: "What does CSS control?",
        answer:
          "CSS controls how a page looks and is arranged: colors, typography, spacing, and layouts.",
      },
      {
        id: "javascript",
        topic: "JavaScript",
        question: "What does JavaScript add to a web page?",
        answer:
          "JavaScript adds behavior, such as responding to clicks, updating content, and checking form input.",
      },
      {
        id: "dom",
        topic: "Browser basics",
        question: "What is the DOM?",
        answer:
          "The Document Object Model is the browser's structured representation of a page. JavaScript can read and update it.",
      },
      {
        id: "semantic-html",
        topic: "Accessibility",
        question: "Why use semantic HTML?",
        answer:
          "Elements like <main> and <nav> describe their purpose, helping browsers and assistive technologies understand a page.",
      },
      {
        id: "api",
        topic: "Web basics",
        question: "What is an API?",
        answer:
          "An API is a defined way for one piece of software to request data or actions from another.",
      },
    ],
  },
  ai: {
    title: "AI fundamentals",
    description: "A few ideas behind modern AI",
    icon: "✳",
    cards: [
      {
        id: "model",
        topic: "Basics",
        question: "What is a machine learning model?",
        answer:
          "A model is a program with learned patterns that it uses to make predictions or generate outputs.",
      },
      {
        id: "training",
        topic: "Training",
        question: "What happens during training?",
        answer:
          "Training adjusts a model using examples so its outputs better match a learning goal.",
      },
      {
        id: "inference",
        topic: "Basics",
        question: "What does inference mean?",
        answer:
          "Inference is using a trained model to produce a prediction or response for new input.",
      },
      {
        id: "tokens",
        topic: "Language models",
        question: "What is a token?",
        answer:
          "A token is a piece of text—such as a word, part of a word, or punctuation—that a language model processes.",
      },
      {
        id: "prompt",
        topic: "Language models",
        question: "What is a prompt?",
        answer:
          "A prompt is the input and instructions given to a model to guide the response it generates.",
      },
      {
        id: "hallucination",
        topic: "Responsible AI",
        question: "What is an AI hallucination?",
        answer:
          "A hallucination is an output that sounds plausible but is incorrect or unsupported. Check important claims against reliable sources.",
      },
    ],
  },
};

const deckIds: DeckId[] = ["web", "ai"];

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export default function Home() {
  const [deckId, setDeckId] = useState<DeckId>("web");
  const [cardOrder, setCardOrder] = useState<string[]>(() =>
    decks.web.cards.map((card) => card.id),
  );
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [recallByCard, setRecallByCard] = useState<Record<string, Recall>>({});

  const deck = decks[deckId];
  const card = deck.cards.find((item) => item.id === cardOrder[cardIndex]);
  const currentCard = card ?? deck.cards[0];
  const progressKey = `${deckId}:${currentCard.id}`;
  const rememberedCount = deck.cards.filter(
    (item) => recallByCard[`${deckId}:${item.id}`] === "remembered",
  ).length;
  const progress = Math.round((rememberedCount / deck.cards.length) * 100);

  function goToCard(index: number) {
    setCardIndex((index + cardOrder.length) % cardOrder.length);
    setIsFlipped(false);
  }

  function changeDeck(nextDeckId: DeckId) {
    setDeckId(nextDeckId);
    setCardOrder(decks[nextDeckId].cards.map((item) => item.id));
    setCardIndex(0);
    setIsFlipped(false);
  }

  function markCard(recall: Recall) {
    setRecallByCard((previous) => ({
      ...previous,
      [progressKey]: recall,
    }));
    goToCard(cardIndex + 1);
  }

  function resetDeck() {
    setRecallByCard((previous) => {
      const next = { ...previous };
      for (const item of deck.cards) {
        delete next[`${deckId}:${item.id}`];
      }
      return next;
    });
    setCardOrder(deck.cards.map((item) => item.id));
    setCardIndex(0);
    setIsFlipped(false);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName))
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        setIsFlipped((flipped) => !flipped);
      } else if (event.key === "ArrowRight") {
        setCardIndex((index) => (index + 1) % cardOrder.length);
        setIsFlipped(false);
      } else if (event.key === "ArrowLeft") {
        setCardIndex(
          (index) => (index - 1 + cardOrder.length) % cardOrder.length,
        );
        setIsFlipped(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cardOrder.length]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Recall home">
          <span className="brand-mark" aria-hidden="true">
            R
          </span>
          <span>recall</span>
        </Link>
        <span className="topbar-note">
          <span className="online-dot" />
          Your personal study space
        </span>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span className="section-label">YOUR DECKS</span>
            <span className="deck-total">0{deckIds.length}</span>
          </div>
          <nav className="deck-list" aria-label="Choose a flashcard deck">
            {deckIds.map((id) => {
              const item = decks[id];
              const selected = deckId === id;
              return (
                <button
                  className={`deck-button${selected ? " selected" : ""}`}
                  key={id}
                  onClick={() => changeDeck(id)}
                  aria-current={selected ? "page" : undefined}
                >
                  <span className={`deck-icon deck-icon-${id}`} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="deck-copy">
                    <strong>{item.title}</strong>
                    <span>{item.cards.length} cards</span>
                  </span>
                  {selected && <span className="selected-indicator" />}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-tip">
            <span className="tip-star" aria-hidden="true">
              ✦
            </span>
            <p>
              <strong>Little by little.</strong>
              A few cards each day go a long way.
            </p>
          </div>
        </aside>

        <section className="study-area" aria-labelledby="page-title">
          <div className="page-heading">
            <div>
              <p className="eyebrow">A QUIET MOMENT TO LEARN</p>
              <h1 id="page-title">Make it stick.</h1>
              <p className="page-description">
                Think of your answer, then flip the card to check.
              </p>
            </div>
            <button className="text-button" onClick={resetDeck}>
              Start over
            </button>
          </div>

          <section className="study-panel" aria-label={`${deck.title} study session`}>
            <div className="deck-summary">
              <div className="deck-title">
                <span className={`deck-icon deck-icon-large deck-icon-${deckId}`}>
                  {deck.icon}
                </span>
                <div>
                  <h2>{deck.title}</h2>
                  <p>{deck.description}</p>
                </div>
              </div>
              <button
                className="shuffle-button"
                onClick={() => {
                  setCardOrder(shuffle(deck.cards).map((item) => item.id));
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
                aria-label="Shuffle this deck"
              >
                <span aria-hidden="true">⤨</span>
                Shuffle
              </button>
            </div>

            <div className="progress-section">
              <div className="progress-copy">
                <span>YOUR PROGRESS</span>
                <span>
                  {rememberedCount} of {deck.cards.length} remembered
                </span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Cards remembered"
                aria-valuemin={0}
                aria-valuemax={deck.cards.length}
                aria-valuenow={rememberedCount}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="card-stage">
              <div className={`flashcard${isFlipped ? " flipped" : ""}`}>
                <button
                  className="card-face card-front"
                  onClick={() => setIsFlipped(true)}
                  aria-label={`Reveal answer: ${currentCard.question}`}
                  disabled={isFlipped}
                >
                  <span className="card-meta">
                    <span className="topic-tag">{currentCard.topic}</span>
                    <span className="face-label">QUESTION</span>
                  </span>
                  <span className="card-content">
                    <span className="question-symbol" aria-hidden="true">
                      ?
                    </span>
                    <span className="card-text">{currentCard.question}</span>
                  </span>
                  <span className="card-hint">
                    Click to reveal <kbd>space</kbd>
                  </span>
                </button>

                <button
                  className="card-face card-back"
                  onClick={() => setIsFlipped(false)}
                  aria-label={`Answer: ${currentCard.answer}. Flip back to question.`}
                  disabled={!isFlipped}
                >
                  <span className="card-meta">
                    <span className="topic-tag answer-tag">THE ANSWER</span>
                    <span className="face-label">FLIP BACK</span>
                  </span>
                  <span className="card-content">
                    <span className="answer-spark" aria-hidden="true">
                      ✳
                    </span>
                    <span className="card-text answer-text">
                      {currentCard.answer}
                    </span>
                  </span>
                  <span className="card-hint">How well did you remember?</span>
                </button>
              </div>
            </div>

            <div className="card-footer">
              <button
                className="nav-button"
                onClick={() => goToCard(cardIndex - 1)}
                aria-label="Previous card"
              >
                <span aria-hidden="true">←</span> Previous
              </button>
              <span className="card-count" aria-live="polite">
                <strong>{cardIndex + 1}</strong>
                <span> / {deck.cards.length}</span>
              </span>
              {isFlipped ? (
                <div className="recall-buttons">
                  <button
                    className="recall-button practice-button"
                    onClick={() => markCard("practice")}
                  >
                    <span aria-hidden="true">↻</span> Practice
                  </button>
                  <button
                    className="recall-button remembered-button"
                    onClick={() => markCard("remembered")}
                  >
                    <span aria-hidden="true">✓</span> Got it
                  </button>
                </div>
              ) : (
                <button
                  className="nav-button next-button"
                  onClick={() => goToCard(cardIndex + 1)}
                  aria-label="Next card"
                >
                  Next <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </section>

          <p className="keyboard-note">
            <kbd>←</kbd> <kbd>→</kbd> move between cards
            <span className="note-divider">·</span>
            <kbd>space</kbd> flip card
          </p>
        </section>
      </div>
    </main>
  );
}
