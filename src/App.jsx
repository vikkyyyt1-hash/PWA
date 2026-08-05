import { useState, useEffect } from 'react';
import './App.css';

const questions = [
  {
    prompt: 'Which language is most often used to add interactivity to a page?',
    options: ['HTML', 'CSS', 'JavaScript', 'Markdown'],
    answer: 'JavaScript',
  },
  {
    prompt: 'Which method is used to respond to a user click event?',
    options: ['addEventListener', 'createElement', 'querySelectorAll', 'appendChild'],
    answer: 'addEventListener',
  },
  {
    prompt: 'Which CSS layout system is best for two-dimensional grid-based positioning?',
    options: ['Flexbox', 'Grid', 'Float', 'Inline-block'],
    answer: 'Grid',
  },
];

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Quiz', href: '#quiz' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

const skillCards = [
  ['HTML', 'Semantic structure and accessible content.'],
  ['CSS', 'Responsive layouts, design systems, and modern styling.'],
  ['JavaScript', 'Interactive features and dynamic front-end logic.'],
  ['React', 'Reusable components and scalable user interfaces.'],
  ['Blender', 'Creative modeling and visual enhancement workflows.'],
];

const projectCards = [
  ['Portfolio Landing Page', 'Built with clean HTML and CSS for a strong first impression.'],
  ['Interactive Web App', 'Developed with JavaScript and React for smooth user experiences.'],
  ['3D Visual Concepts', 'Explored Blender-driven design ideas for creative presentation.'],
];

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return window.localStorage.getItem('portfolio-theme') || 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    window.localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizResultText, setQuizResultText] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (option) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedOption(option);

    if (option === currentQuestion.answer) {
      setScore((prev) => prev + 1);
      setQuizResultText('Nice! That answer is correct.');
    } else {
      setQuizResultText(`Not quite — the correct answer is ${currentQuestion.answer}.`);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setQuizResultText('');
      setIsAnswered(false);
    } else {
      setCurrentQuestionIndex(questions.length);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setQuizResultText('');
    setIsAnswered(false);
  };

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formFeedback, setFormFeedback] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormFeedback('Please fill in all fields before sending.');
      return;
    }

    if (!validateEmail(email.trim())) {
      setFormFeedback('Please enter a valid email address.');
      return;
    }

    setFormFeedback(`Thanks, ${name}! Your message is ready to send.`);
    setFormData({ name: '', email: '', message: '' });
  };

  useEffect(() => {
    const revealItems = document.querySelectorAll('.section, .skill-card, .project-card, .hero-card, .quiz-card, .contact-form');

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((item) => {
      item.classList.add('reveal');
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#home" className="text-lg font-bold text-white">Wiktor</a>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/20"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>
            <nav className="flex flex-wrap items-center gap-1" aria-label="Primary navigation">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main id="home" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="section grid gap-8 rounded-[32px] bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur md:grid-cols-[1.3fr_0.9fr] md:p-10">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-600">Web Developer</p>
            <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Hi, I’m Wiktor.</h1>
            <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
              I build polished, responsive experiences with HTML, CSS, JavaScript, React, and Blender.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#projects" className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5">View Projects</a>
              <a href="#contact" className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900">Let’s Talk</a>
            </div>
          </div>

          <aside className="rounded-[28px] border border-white/60 bg-slate-950 p-6 text-slate-100 shadow-[0_18px_45px_rgba(2,6,23,0.35)]">
            <h2 className="mb-4 text-2xl font-bold">What I do</h2>
            <ul className="space-y-3 text-slate-300">
              <li className="rounded-2xl bg-white/5 px-4 py-3">Front-end development</li>
              <li className="rounded-2xl bg-white/5 px-4 py-3">Interactive UI design</li>
              <li className="rounded-2xl bg-white/5 px-4 py-3">Creative 3D visuals with Blender</li>
            </ul>
          </aside>
        </section>

        <section id="about" className="section py-14">
          <div className="rounded-[28px] bg-white/65 p-6 shadow-lg shadow-slate-900/5 backdrop-blur sm:p-8">
            <h2 className="mb-3 text-3xl font-bold text-slate-900">About Me</h2>
            <p className="max-w-3xl text-slate-600">
              I’m a web developer focused on writing clean code and crafting user-friendly interfaces. My background spans front-end development, component-based architecture, and creative visual storytelling.
            </p>
          </div>
        </section>

        <section id="skills" className="section py-8">
          <div className="rounded-[28px] bg-gradient-to-br from-cyan-50 to-violet-50 p-6 shadow-lg shadow-slate-900/5 sm:p-8">
            <h2 className="mb-6 text-3xl font-bold text-slate-900">Skills</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {skillCards.map(([title, desc]) => (
                <article key={title} className="skill-card rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-sm">
                  <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
                  <p className="text-slate-600">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="quiz" className="section py-8">
          <div className="rounded-[28px] bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur sm:p-8">
            <h2 className="mb-5 text-3xl font-bold text-slate-900">Quick Skills Quiz</h2>
            <div className="quiz-card max-w-3xl rounded-[24px] bg-slate-950/95 p-5 text-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.24)] sm:p-6">
              {currentQuestionIndex < questions.length ? (
                <>
                  <p className="question-text mb-4 text-lg font-semibold text-white">{currentQuestion.prompt}</p>
                  <div className="answer-buttons grid gap-3">
                    {currentQuestion.options.map((option) => {
                      let btnClass = 'answer-button rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:bg-white/15';

                      if (isAnswered) {
                        if (option === currentQuestion.answer) btnClass += ' correct border-emerald-400/60 bg-emerald-300 text-slate-900';
                        else if (option === selectedOption) btnClass += ' wrong border-rose-400/70 bg-rose-300 text-slate-900';
                      }

                      return (
                        <button
                          key={option}
                          type="button"
                          className={btnClass}
                          disabled={isAnswered}
                          onClick={() => handleAnswer(option)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="question-text text-lg font-semibold text-white">Quiz complete!</p>
              )}

              <div className="quiz-actions mt-5 flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2.5 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  onClick={nextQuestion}
                  disabled={!isAnswered || currentQuestionIndex >= questions.length}
                >
                  Next Question
                </button>
                <button
                  className="rounded-full border border-white/25 px-4 py-2.5 font-semibold text-white transition hover:bg-white/10"
                  type="button"
                  onClick={resetQuiz}
                >
                  Reset Quiz
                </button>
              </div>

              <p className="quiz-result mt-4 text-sm font-semibold text-cyan-200" aria-live="polite">
                {currentQuestionIndex < questions.length
                  ? quizResultText
                  : `You scored ${score} out of ${questions.length}.`}
              </p>
            </div>
          </div>
        </section>

        <section id="projects" className="section py-8">
          <div className="rounded-[28px] bg-gradient-to-br from-slate-950 to-slate-900 p-6 text-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.28)] sm:p-8">
            <h2 className="mb-6 text-3xl font-bold">Featured Projects</h2>
            <div className="projects-grid grid gap-4 md:grid-cols-3">
              {projectCards.map(([title, description]) => (
                <article key={title} className="project-card rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
                  <p className="text-slate-300">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-white/10 bg-slate-950/90 text-slate-100">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="mb-3 text-3xl font-bold">Let’s Connect</h2>
            <p className="text-slate-300">Email: wiktor@example.com</p>
          </div>

          <form className="contact-form rounded-[28px] bg-white/5 p-5 backdrop-blur" onSubmit={handleContactSubmit} noValidate>
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-200">
                Name
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none ring-0 transition focus:border-cyan-400"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-200">
                Email
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-200">
                Message
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  placeholder="Tell me about your project"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </label>
            </div>
            <button type="submit" className="mt-4 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 font-semibold text-slate-950">Send Message</button>
            <p className="form-message mt-3 text-sm font-semibold text-cyan-200" aria-live="polite">{formFeedback}</p>
          </form>
        </div>
      </footer>
    </div>
  );
}