import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'capstone-quiz-progress'

const questions = [
  {
    prompt: 'Which HTML tag is used to create a button?',
    options: ['<div>', '<button>', '<span>', '<input>'],
    answer: '<button>',
  },
  {
    prompt: 'What does CSS stand for?',
    options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Color Styling System', 'Computer Style Syntax'],
    answer: 'Cascading Style Sheets',
  },
  {
    prompt: 'Which React hook is used for managing local component state?',
    options: ['useEffect', 'useRef', 'useState', 'useMemo'],
    answer: 'useState',
  },
  {
    prompt: 'Which tool is commonly used to build and run a Vite app?',
    options: ['npm', 'git', 'docker', 'python'],
    answer: 'npm',
  },
]

const initialProgress = {
  currentIndex: 0,
  score: 0,
  completed: false,
  selectedAnswer: null,
  feedback: 'Choose the best answer to begin.',
}

function App() {
  const [progress, setProgress] = useState(initialProgress)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return
    }

    try {
      const parsed = JSON.parse(saved)
      setProgress({ ...initialProgress, ...parsed })
    } catch (error) {
      console.warn('Unable to load saved progress', error)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const scorePercent = useMemo(() => {
    if (!questions.length) {
      return 0
    }

    return Math.round((progress.score / questions.length) * 100)
  }, [progress.score])

  const currentQuestion = questions[progress.currentIndex]

  const handleAnswer = (option) => {
    if (progress.selectedAnswer !== null) {
      return
    }

    const isCorrect = option === currentQuestion.answer
    const nextScore = isCorrect ? progress.score + 1 : progress.score
    const feedback = isCorrect
      ? 'Correct answer. Great work!'
      : `Not quite. The correct answer is ${currentQuestion.answer}.`

    setProgress((previous) => ({
      ...previous,
      score: nextScore,
      selectedAnswer: option,
      feedback,
    }))
  }

  const handleNext = () => {
    if (progress.currentIndex === questions.length - 1) {
      setProgress((previous) => ({
        ...previous,
        completed: true,
        selectedAnswer: null,
        feedback: 'You finished the first pass. Restart anytime to try again.',
      }))
      return
    }

    setProgress((previous) => ({
      ...previous,
      currentIndex: previous.currentIndex + 1,
      selectedAnswer: null,
      feedback: 'Choose the next answer to continue.',
    }))
  }

  const handleRestart = () => {
    setProgress(initialProgress)
  }

  return (
    <main className="app-shell">
      <section className="card" aria-labelledby="app-title">
        <header className="hero">
          <div>
            <p className="eyebrow">Interactive capstone demo</p>
            <h1 id="app-title">Focus Quest</h1>
            <p className="intro">
              This project now includes a polished web experience with a short quiz loop,
              progress tracking, responsive layout, and local save support for a stronger capstone feel.
            </p>
          </div>
          <div className="stats" aria-label="Quiz statistics">
            <div>
              <span>Score</span>
              <strong>{progress.score}/{questions.length}</strong>
            </div>
            <div>
              <span>Progress</span>
              <strong>{scorePercent}%</strong>
            </div>
          </div>
        </header>

        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${scorePercent}%` }} />
        </div>

        {progress.completed ? (
          <div className="summary">
            <h2>Session complete</h2>
            <p>
              You finished the first round with {progress.score} correct answer{progress.score === 1 ? '' : 's'}.
              Restart the quiz to improve your score.
            </p>
            <button type="button" className="primary" onClick={handleRestart}>
              Restart quiz
            </button>
          </div>
        ) : (
          <>
            <div className="question-card">
              <p className="question-number">
                Question {progress.currentIndex + 1} of {questions.length}
              </p>
              <h2>{currentQuestion.prompt}</h2>
              <div className="options" role="list">
                {currentQuestion.options.map((option) => {
                  const isSelected = progress.selectedAnswer === option
                  const isCorrect = progress.selectedAnswer !== null && option === currentQuestion.answer
                  const isWrong = progress.selectedAnswer === option && option !== currentQuestion.answer

                  return (
                    <button
                      key={option}
                      type="button"
                      className={`option${isSelected ? ' selected' : ''}${isCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}`}
                      onClick={() => handleAnswer(option)}
                      disabled={progress.selectedAnswer !== null}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>

            <p className="feedback" aria-live="polite">
              {progress.feedback}
            </p>

            <div className="actions">
              <button type="button" className="secondary" onClick={handleRestart}>
                Reset
              </button>
              <button
                type="button"
                className="primary"
                onClick={handleNext}
                disabled={progress.selectedAnswer === null}
              >
                {progress.currentIndex === questions.length - 1 ? 'Finish' : 'Next question'}
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default App
