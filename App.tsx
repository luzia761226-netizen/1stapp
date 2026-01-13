
import React, { useState, useEffect, useRef } from 'react';
import { AppState, QuizQuestion, UserStats, LeaderboardEntry } from './types';
import { POPULAR_BOOKS, CATEGORIES, BADGES } from './constants';

const SOUNDS = {
  CORRECT: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  WRONG: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  LEVEL_UP: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  BONUS: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'
};

const XPProgress = ({ current, max, color = 'bg-blue-500', height = 'h-3', showShimmer = true }: { current: number, max: number, color?: string, height?: string, showShimmer?: boolean }) => (
  <div className={`w-full bg-white/10 rounded-full ${height} overflow-hidden backdrop-blur-sm border border-white/20`}>
    <div 
      className={`${color} ${height} transition-all duration-1000 ease-out relative ${showShimmer ? 'shimmer' : ''}`} 
      style={{ width: `${Math.min(100, (current / max) * 100)}%` }}
    >
      <div className="absolute top-0 right-0 h-full w-2 bg-white/30 blur-sm"></div>
    </div>
  </div>
);

const Header: React.FC<{ stats: UserStats, onShowAchievements: () => void, onHome: () => void, onShowHallOfFame: () => void }> = ({ stats, onShowAchievements, onHome, onShowHallOfFame }) => (
  <header className="bg-slate-900/80 backdrop-blur-xl shadow-2xl py-4 px-6 flex items-center justify-between sticky top-0 z-50 border-b border-white/5">
    <div className="flex items-center gap-3 cursor-pointer group" onClick={onHome}>
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div>
        <h1 className="text-xl font-black text-white tracking-tighter glow-text">여량초 독서왕</h1>
        <div className="text-[10px] font-bold text-blue-400 tracking-widest uppercase -mt-1">Yeoryang Literature Festival</div>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex flex-col items-end">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black text-slate-400">LV.{stats.level}</span>
          <span className="text-[10px] font-black text-blue-400">{stats.xp % 100}/100</span>
        </div>
        <div className="w-24">
          <XPProgress current={stats.xp % 100} max={100} color="bg-gradient-to-r from-blue-400 to-indigo-500" height="h-1.5" />
        </div>
      </div>
      <button onClick={onShowHallOfFame} className="p-2.5 bg-yellow-400/10 text-yellow-400 rounded-xl hover:bg-yellow-400/20 transition-colors border border-yellow-400/20 group">
        <span className="text-xl group-hover:scale-110 transition-transform block">🏛️</span>
      </button>
      <button 
        onClick={onShowAchievements}
        className="relative p-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 hover:shadow-md transition-all border border-white/10 group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform block">🏆</span>
        {stats.unlockedBadges.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-sm">
            {stats.unlockedBadges.length}
          </span>
        )}
      </button>
    </div>
  </header>
);

export default function App() {
  const [state, setState] = useState<AppState>(AppState.HOME);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean, explanation: string, xpGained: number, leveledUp: boolean, bonusTime?: boolean } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>('');
  const [solvedQuizIds, setSolvedQuizIds] = useState<number[]>([]); 
  
  const timerRef = useRef<number | null>(null);

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('yeoryang_stats_v12');
    return saved ? JSON.parse(saved) : {
      xp: 0,
      level: 1,
      streak: 0,
      bestStreak: 0,
      correctAnswers: 0,
      totalAttempts: 0,
      unlockedBadges: []
    };
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('yeoryang_hall_v12');
    return saved ? JSON.parse(saved) : [];
  });

  const playSound = (url: string, volume: number = 0.5) => {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(e => console.debug("Sound blocked"));
  };

  useEffect(() => {
    localStorage.setItem('yeoryang_stats_v12', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('yeoryang_hall_v12', JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    if (state === AppState.QUIZ || state === AppState.RESULT) {
      if (!timerRef.current) {
        timerRef.current = window.setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              if (timerRef.current !== null) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
              }
              setState(AppState.GAME_OVER);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state]);

  const startNextRandomQuiz = () => {
    // 5,000개 전수 순환 시스템: 중복 방지 로직 강화
    const pool = POPULAR_BOOKS.filter(book => !solvedQuizIds.includes(book.id));
    
    if (pool.length === 0) {
      // 모든 문제를 다 풀었을 때만 초기화 (5,000개 도달 시)
      setSolvedQuizIds([]);
      const book = POPULAR_BOOKS[Math.floor(Math.random() * POPULAR_BOOKS.length)];
      setupQuiz(book);
      return;
    }

    // 풀지 않은 문제 중 무작위 선택
    const randomIndex = Math.floor(Math.random() * pool.length);
    const book = pool[randomIndex];
    setupQuiz(book);
  };

  const setupQuiz = (book: any) => {
    const originalQuiz = book.quiz;
    setSolvedQuizIds(prev => [...prev, book.id]);

    const shuffledOptions = [...originalQuiz.options];
    const correctAnswerText = originalQuiz.options[originalQuiz.correctAnswerIndex];
    
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);

    setLastResult(null);
    setCurrentQuiz({
      ...originalQuiz,
      options: shuffledOptions,
      correctAnswerIndex: newCorrectIndex
    });
    setState(AppState.QUIZ);
  };

  const startNewExploration = () => {
    setTimeLeft(60);
    setSessionScore(0);
    // 세션이 바뀌어도 전체 중복 방지는 유지하고 싶다면 solvedQuizIds를 초기화하지 않음
    // 여기서는 '게임 한 판'의 관점에서 현재 푼 리스트만 유지
    setStats(prev => ({ ...prev, streak: 0 })); 
    startNextRandomQuiz();
  };

  const handleAnswer = (index: number) => {
    if (!currentQuiz) return;

    const isCorrect = index === currentQuiz.correctAnswerIndex;
    const newStreak = isCorrect ? stats.streak + 1 : 0;
    let bonusApplied = false;

    if (isCorrect) {
      playSound(SOUNDS.CORRECT, 0.4);
      if (newStreak > 0 && newStreak % 5 === 0) {
        setTimeLeft(prev => prev + 3);
        playSound(SOUNDS.BONUS, 0.6);
        bonusApplied = true;
      }
    } else {
      playSound(SOUNDS.WRONG, 0.3);
    }

    const xpGained = isCorrect ? (20 + (stats.streak * 5)) : 0;
    if (isCorrect) setSessionScore(prev => prev + xpGained);

    const prevLevel = stats.level;
    const newTotalXp = stats.xp + xpGained;
    const newLevel = Math.floor(newTotalXp / 100) + 1;
    const leveledUp = newLevel > prevLevel;

    if (leveledUp) playSound(SOUNDS.LEVEL_UP, 0.6);

    const newStats = {
      ...stats,
      xp: newTotalXp,
      level: newLevel,
      streak: newStreak,
      bestStreak: Math.max(stats.bestStreak, newStreak),
      correctAnswers: stats.correctAnswers + (isCorrect ? 1 : 0),
      totalAttempts: stats.totalAttempts + 1,
    };

    const newlyUnlocked = BADGES.filter(b => !stats.unlockedBadges.includes(b.id) && b.condition(newStats));
    if (newlyUnlocked.length > 0) {
      newStats.unlockedBadges = [...newStats.unlockedBadges, ...newlyUnlocked.map(b => b.id)];
    }

    setStats(newStats);
    setLastResult({ isCorrect, explanation: currentQuiz.explanation, xpGained, leveledUp, bonusTime: bonusApplied });
    setState(AppState.RESULT);
  };

  const saveToHallOfFame = () => {
    if (!playerName.trim()) return;
    const newEntry: LeaderboardEntry = {
      name: playerName.trim(),
      score: sessionScore,
      date: new Date().toLocaleDateString()
    };
    
    const currentList = JSON.parse(localStorage.getItem('yeoryang_hall_v12') || '[]');
    const updated = [...currentList, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); 
    
    setLeaderboard(updated);
    localStorage.setItem('yeoryang_hall_v12', JSON.stringify(updated));
    setState(AppState.LEADERBOARD);
    setPlayerName('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 overflow-x-hidden selection:bg-blue-500/30">
      <Header 
        stats={stats} 
        onShowAchievements={() => setState(AppState.ACHIEVEMENTS)}
        onShowHallOfFame={() => setState(AppState.LEADERBOARD)}
        onHome={() => setState(AppState.HOME)}
      />
      
      {(state === AppState.QUIZ || state === AppState.RESULT) && (
        <div className="fixed top-24 left-8 z-[60] animate-in slide-in-from-left-8 duration-500">
          <div className={`px-8 py-4 rounded-3xl border-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl flex items-center gap-4 transition-all duration-300 ${
            timeLeft <= 10 ? 'bg-rose-600 border-white text-white timer-danger animate-shake' : 'bg-slate-800/90 border-blue-500 text-blue-400'
          }`}>
            <span className="text-2xl">{timeLeft <= 10 ? '🚨' : '⏱️'}</span>
            <span className="font-game text-3xl tracking-tighter">{timeLeft}s</span>
          </div>
          {lastResult?.bonusTime && (
            <div className="mt-2 bg-yellow-400 text-slate-900 font-black px-4 py-1 rounded-full text-sm animate-bounce text-center shadow-lg">
              BONUS +3s
            </div>
          )}
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
        {state === AppState.HOME && (
          <div className="flex flex-col items-center text-center py-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="relative mb-16 w-full max-w-4xl">
              <div className="absolute inset-0 bg-blue-600 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
              <div className="relative rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] border-8 border-white/5 aspect-video max-w-3xl mx-auto bg-slate-800">
                <img 
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop" 
                  alt="책을 즐겁게 읽는 학생" 
                  className="w-full h-full object-cover opacity-90" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-slate-900/80 via-transparent to-transparent">
                  <div className="flex gap-10 animate-float items-end pb-12">
                    <div className="text-[120px] drop-shadow-2xl">📖</div>
                    <div className="text-[90px] mb-6 bg-white/20 p-8 rounded-full backdrop-blur-3xl border border-white/30 shadow-2xl">✨</div>
                    <div className="text-[120px] drop-shadow-2xl">🌳</div>
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] glow-text text-white">
              여량초등학교<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">독서 퀴즈 보물섬</span>
            </h2>
            <p className="text-2xl md:text-3xl text-slate-300 mb-14 max-w-3xl font-medium leading-relaxed">
              절대 중복 없는 5,000개의 지혜 퀴즈가 준비되었습니다!<br/>
              5콤보마다 3초 보너스! 모든 보물을 찾아보세요.
            </p>
            
            <button 
              onClick={startNewExploration}
              className="group bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black py-8 px-16 rounded-[3rem] shadow-[0_30px_80px_rgba(37,99,235,0.4)] transform transition-all active:scale-95 text-4xl flex items-center justify-center gap-6 border-b-8 border-indigo-900"
            >
              모험 시작!
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 group-hover:translate-x-3 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        )}

        {state === AppState.QUIZ && currentQuiz && (
          <div className="max-w-4xl mx-auto py-20 animate-in zoom-in duration-500">
            <div className="glass rounded-[4rem] shadow-[0_50px_150px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 flex flex-col lg:flex-row">
              <div className="lg:w-80 bg-slate-950/50 p-12 text-white flex flex-col justify-between border-r border-white/5 relative overflow-hidden">
                <div className="absolute -bottom-10 -left-10 text-[180px] opacity-10 rotate-12 pointer-events-none">📚</div>
                <div className="relative z-10">
                  <span className="text-blue-500 font-black text-[10px] tracking-[0.5em] uppercase mb-4 block tracking-widest">MISSION</span>
                  <h4 className="text-4xl font-black mb-12 leading-tight tracking-tighter glow-text">{currentQuiz.bookTitle}</h4>
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-inner">
                    <div className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest text-center">콤보 카운트</div>
                    <div className="text-5xl font-game text-orange-400 animate-pulse text-center">🔥 {stats.streak}</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-12 lg:p-24 bg-slate-900/40 relative">
                <div className="flex items-center gap-4 mb-14">
                  <div className="h-2 w-24 bg-blue-500 rounded-full glow-text"></div>
                  <span className="font-game text-slate-500 text-sm tracking-widest uppercase">지혜 탐험 중 ({solvedQuizIds.length} / 5000)</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-20 leading-[1.1] tracking-tighter">
                  {currentQuiz.question}
                </h3>
                <div className="grid gap-6">
                  {currentQuiz.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className="group w-full text-left p-8 rounded-[2.5rem] border-2 border-white/5 hover:border-blue-500 hover:bg-blue-600/10 transition-all active:scale-[0.97] flex items-center gap-8 shadow-lg"
                    >
                      <span className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-xl font-black text-slate-500 transition-all shadow-xl">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-2xl font-bold text-slate-200 group-hover:text-white transition-colors">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {state === AppState.RESULT && lastResult && (
          <div className="max-w-3xl mx-auto py-20 animate-in scale-95 fade-in duration-500">
            <div className={`rounded-[4rem] p-16 text-center relative overflow-hidden shadow-[0_60px_150px_rgba(0,0,0,0.7)] border border-white/20 ${
              lastResult.isCorrect ? 'bg-indigo-700/80 text-white' : 'bg-rose-600/80 text-white'
            }`}>
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-[140px] mb-10 animate-float drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  {lastResult.isCorrect ? (lastResult.bonusTime ? '⏰✨' : '💎') : '📚'}
                </div>
                <h3 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter">
                  {lastResult.isCorrect ? (lastResult.bonusTime ? '5콤보! 보너스 시간 획득!' : '보물을 찾았습니다!') : '다시 한 번 생각해볼까요?'}
                </h3>
                
                {lastResult.isCorrect && (
                  <div className="bg-white/10 px-12 py-5 rounded-full font-black text-4xl mb-12 backdrop-blur-xl border border-white/20 shadow-inner flex gap-6 items-center justify-center">
                    <div><span className="text-yellow-400">+</span> {lastResult.xpGained} <span className="text-xl text-white/50">EXP</span></div>
                    {lastResult.bonusTime && <div className="text-green-400 border-l border-white/20 pl-6"><span className="text-yellow-400">+</span> 3 <span className="text-xl text-white/50">SEC</span></div>}
                  </div>
                )}
                
                <div className="w-full bg-slate-900/80 rounded-[3rem] p-12 text-left shadow-2xl border border-white/5">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-4xl">💡</div>
                    <h4 className="font-black text-white text-2xl tracking-tighter uppercase opacity-80">지혜의 한 마디</h4>
                  </div>
                  <p className="text-slate-200 text-xl font-medium leading-relaxed italic border-l-4 border-indigo-500 pl-10 py-2">
                    "{lastResult.explanation}"
                  </p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={startNextRandomQuiz}
              className="mt-12 w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-8 rounded-[3rem] shadow-[0_30px_70px_rgba(37,99,235,0.4)] transition-all active:scale-95 text-3xl flex items-center justify-center gap-6 border-b-8 border-blue-900"
            >
              다음 문제 도전하기!
            </button>
          </div>
        )}

        {state === AppState.GAME_OVER && (
          <div className="max-w-2xl mx-auto py-10 text-center animate-in zoom-in duration-1000">
             <div className="glass rounded-[5rem] p-16 shadow-[0_60px_150px_rgba(0,0,0,0.8)] border-8 border-indigo-600/50 overflow-hidden relative">
               <h2 className="text-7xl font-black text-white mb-4 tracking-tighter uppercase glow-text">탐험 종료</h2>
               <p className="text-2xl font-bold text-slate-400 mb-14">획득한 보물 점수</p>
               
               <div className="bg-white/5 rounded-[4rem] p-12 mb-14 border border-white/10 shadow-inner">
                 <div className="text-9xl font-game text-indigo-400 glow-text">{sessionScore}</div>
               </div>

               <div className="flex flex-col gap-6">
                  <input 
                    type="text" 
                    maxLength={12}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="예: 3-1 홍길동"
                    className="w-full bg-white/5 border-2 border-white/10 focus:border-indigo-500 rounded-[2.5rem] px-10 py-6 text-2xl font-black text-white outline-none transition-all placeholder:text-white/20"
                  />
                  <button 
                    onClick={saveToHallOfFame}
                    disabled={!playerName.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black px-12 py-8 rounded-[2.5rem] shadow-2xl transition-all text-3xl border-b-8 border-indigo-950"
                  >
                    명예의 전당 등록하기
                  </button>
               </div>
             </div>
             <button onClick={() => setState(AppState.HOME)} className="mt-12 text-slate-500 font-black hover:text-white transition-colors text-xl underline underline-offset-8">첫 화면으로</button>
          </div>
        )}

        {state === AppState.LEADERBOARD && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 pt-10">
             <div className="text-center mb-20">
               <h2 className="text-8xl font-black text-white tracking-tighter glow-text">🏛️ 영구 명예의 전당</h2>
               <p className="text-slate-400 mt-4 text-2xl">여량초등학교 역사에 기록될 위대한 탐험가들</p>
             </div>

             <div className="max-w-3xl mx-auto glass rounded-[5rem] shadow-[0_60px_180px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10">
               <div className="p-8 max-h-[600px] overflow-y-auto no-scrollbar">
                 {leaderboard.length === 0 ? (
                   <div className="py-32 text-center text-slate-500 font-black text-3xl">기록을 기다리는 중입니다...</div>
                 ) : (
                   <div className="space-y-4">
                     {leaderboard.map((entry, idx) => (
                       <div key={idx} className={`flex items-center gap-8 p-8 rounded-[3rem] transition-all border-2 ${
                         idx === 0 ? 'bg-yellow-400/10 border-yellow-400/40' : (idx < 3 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-transparent')
                       }`}>
                         <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center font-game text-3xl shadow-2xl ${
                           idx === 0 ? 'bg-yellow-400 text-slate-900' : (idx < 3 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500')
                         }`}>
                           {idx + 1}
                         </div>
                         <div className="flex-1 text-3xl font-black text-white truncate">
                           {entry.name}
                           {idx < 3 && <span className="ml-4 text-2xl">{idx === 0 ? '👑' : (idx === 1 ? '🥈' : '🥉')}</span>}
                         </div>
                         <div className="text-5xl font-game text-indigo-400 glow-text">{entry.score}</div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
               <div className="bg-slate-950/50 p-12 flex gap-6">
                  <button onClick={() => setState(AppState.HOME)} className="flex-1 bg-slate-800 text-white font-black py-7 rounded-[2.5rem] hover:bg-slate-700 transition-all text-2xl border border-white/10">메인 화면으로</button>
               </div>
             </div>
          </div>
        )}

        {state === AppState.ACHIEVEMENTS && (
          <div className="animate-in fade-in slide-in-from-right-12 duration-700 pt-10">
             <div className="flex items-center justify-between mb-20">
                <h2 className="text-7xl font-black text-white tracking-tighter glow-text">🏆 개인 누적 업적</h2>
                <button onClick={() => setState(AppState.HOME)} className="p-6 bg-white/5 rounded-[2rem] hover:bg-white/10 transition-all border border-white/10">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
                <div className="glass p-12 rounded-[4rem] flex items-center gap-10 relative overflow-hidden">
                   <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[3rem] flex items-center justify-center text-8xl font-game text-white shadow-xl">
                      {stats.level}
                   </div>
                   <div className="flex-1 z-10">
                      <span className="text-blue-400 font-black text-xs tracking-widest uppercase mb-2 block">Adventurer Level</span>
                      <h3 className="text-4xl font-black text-white mb-6">여량의 현자</h3>
                      <XPProgress current={stats.xp % 100} max={100} color="bg-blue-500" height="h-4" />
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10">
               {BADGES.map(badge => {
                 const isUnlocked = stats.unlockedBadges.includes(badge.id);
                 return (
                   <div key={badge.id} className={`p-10 rounded-[3.5rem] border-2 text-center transition-all relative overflow-hidden group ${
                     isUnlocked ? 'bg-white/5 border-yellow-500/40 shadow-2xl hover:-translate-y-3' : 'bg-white/2 opacity-20 border-white/5 grayscale'
                   }`}>
                     <div className={`text-7xl mb-6 transition-transform duration-500 ${isUnlocked ? 'group-hover:scale-125 group-hover:rotate-6' : ''}`}>{badge.icon}</div>
                     <div className="font-black text-white text-xl mb-2">{badge.name}</div>
                     <div className="text-[11px] font-bold text-slate-500 leading-tight px-2">{badge.description}</div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}
      </main>

      <footer className="bg-black/40 py-24 px-6 text-center text-white/20 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <p className="text-blue-500 text-sm font-black uppercase tracking-[0.8em] mb-6">Yeoryang Elementary School Library</p>
          <p className="text-lg font-medium leading-relaxed max-w-lg mx-auto mb-12 italic opacity-60">
            "5,000개의 보물을 모두 정복하는 그날까지 여러분의 도전을 응원합니다!"
          </p>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-30">© 2024 Yeoryang Library - Ultimate 5000 Edition</p>
        </div>
      </footer>
    </div>
  );
}
