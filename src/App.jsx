import { useState, useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar } from 'react-chartjs-2'
import confetti from 'canvas-confetti'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

const INITIAL_PARTICIPANTS = [
  'Player 1',
  'Player 2',
  'Player 3',
  'Player 4',
  'Player 5',
  'Player 6',
  'Player 7',
  'Player 8',
  'Player 9',
  'Player 10',
]

const ROUND_COLORS = {
  1: { bg: 'rgba(99, 102, 241, 0.85)', border: 'rgb(99, 102, 241)', gradient: 'from-indigo-500 to-blue-600' },
  2: { bg: 'rgba(16, 185, 129, 0.85)', border: 'rgb(16, 185, 129)', gradient: 'from-emerald-500 to-teal-600' },
  3: { bg: 'rgba(251, 146, 60, 0.85)', border: 'rgb(251, 146, 60)', gradient: 'from-orange-500 to-amber-600' },
}

const TOP_5_COLORS = [
  'bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/30', // 1st - Gold
  'bg-gradient-to-r from-gray-300 via-gray-400 to-slate-400 text-white shadow-lg shadow-gray-400/30', // 2nd - Silver
  'bg-gradient-to-r from-amber-600 via-orange-700 to-amber-800 text-white shadow-lg shadow-amber-700/30', // 3rd - Bronze
  'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30', // 4th
  'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30', // 5th
]

function App() {
  const [currentRound, setCurrentRound] = useState(1)
  const [showSummary, setShowSummary] = useState(false)
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS)
  const [scores, setScores] = useState({
    1: Array(10).fill(0),
    2: Array(10).fill(0),
    3: Array(10).fill(0),
  })
  const [editingName, setEditingName] = useState(null)
  const confettiTriggered = useRef(false)

  // Confetti effect when summary is shown
  useEffect(() => {
    if (showSummary && !confettiTriggered.current) {
      confettiTriggered.current = true
      // Fire multiple confetti bursts for a more dramatic effect
      const duration = 3000
      const end = Date.now() + duration

      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4']
      
      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: colors
        })
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: colors
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()

      // Also fire some big bursts
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          colors: colors
        })
      }, 500)
    } else if (!showSummary) {
      confettiTriggered.current = false
    }
  }, [showSummary])

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('quizScoreboard')
    if (savedData) {
      const { participants: savedParticipants, scores: savedScores, currentRound: savedRound, showSummary: savedShowSummary } = JSON.parse(savedData)
      if (savedParticipants) setParticipants(savedParticipants)
      if (savedScores) setScores(savedScores)
      if (savedRound) setCurrentRound(savedRound)
      if (savedShowSummary) setShowSummary(savedShowSummary)
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('quizScoreboard', JSON.stringify({ participants, scores, currentRound, showSummary }))
  }, [participants, scores, currentRound, showSummary])

  const updateScore = (participantIndex, value) => {
    const newValue = Math.max(0, parseInt(value) || 0)
    setScores(prev => ({
      ...prev,
      [currentRound]: prev[currentRound].map((s, i) => i === participantIndex ? newValue : s)
    }))
  }

  const incrementScore = (participantIndex, amount) => {
    setScores(prev => ({
      ...prev,
      [currentRound]: prev[currentRound].map((s, i) => 
        i === participantIndex ? Math.max(0, s + amount) : s
      )
    }))
  }

  const updateParticipantName = (index, name) => {
    setParticipants(prev => prev.map((p, i) => i === index ? name : p))
    setEditingName(null)
  }

  const nextRound = () => {
    if (showSummary) return
    if (currentRound < 3) {
      setCurrentRound(currentRound + 1)
    } else {
      setShowSummary(true)
    }
  }

  const prevRound = () => {
    if (showSummary) {
      setShowSummary(false)
    } else if (currentRound > 1) {
      setCurrentRound(currentRound - 1)
    }
  }

  const goToSummary = () => {
    setShowSummary(true)
  }

  const goToRound = (round) => {
    setShowSummary(false)
    setCurrentRound(round)
  }

  const resetAll = () => {
    if (confirm('Are you sure you want to reset all data?')) {
      setScores({
        1: Array(10).fill(0),
        2: Array(10).fill(0),
        3: Array(10).fill(0),
      })
      setCurrentRound(1)
      setShowSummary(false)
      setParticipants(INITIAL_PARTICIPANTS)
      localStorage.removeItem('quizScoreboard')
    }
  }

  // Get sorted rankings for summary
  const getRankings = () => {
    const totalScoresData = participants.map((name, i) => ({
      name,
      index: i,
      round1: scores[1][i],
      round2: scores[2][i],
      round3: scores[3][i],
      total: scores[1][i] + scores[2][i] + scores[3][i]
    }))
    return totalScoresData.sort((a, b) => b.total - a.total)
  }

  const getTotalScores = () => {
    return participants.map((_, i) => 
      scores[1][i] + scores[2][i] + scores[3][i]
    )
  }

  // Chart data for current round only
  const chartData = {
    labels: participants,
    datasets: [
      {
        label: `Round ${currentRound}`,
        data: scores[currentRound],
        backgroundColor: ROUND_COLORS[currentRound].bg,
        borderColor: ROUND_COLORS[currentRound].border,
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `🎯 Scoreboard - Round ${currentRound}`,
        font: { size: 24, weight: 'bold' },
        color: '#1f2937',
        padding: 20,
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#1f2937',
        font: {
          size: 14,
          weight: 'bold',
        },
        formatter: (value) => value > 0 ? value : '',
      },
    },
    scales: {
      x: {
        ticks: {
          font: { size: 12, weight: '600' },
          color: '#374151',
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 12 },
          color: '#6b7280',
        },
        grid: { color: 'rgba(0,0,0,0.1)' },
      },
    },
  }

  const totalScores = getTotalScores()

  const rankings = getRankings()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 via-pink-100 to-orange-100 p-8 md:p-12 flex items-start justify-center">
      <div className="w-full max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h1 
          className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-4 drop-shadow-sm"
          style={{ padding: '20px 0px 10px 0px' }}
          >
            🎮 Scoreboard
          </h1>
          
          {/* Round Navigation Tabs */}
          <div
          className="flex items-center justify-center gap-2 flex-wrap"
          style={{ padding: '0px 0px 10px 0px' }}
          >
            {[1, 2, 3].map((round) => (
              <button
                key={round}
                onClick={() => goToRound(round)}
                className={`px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 ${
                  !showSummary && currentRound === round
                    ? `bg-gradient-to-r ${ROUND_COLORS[round].gradient} text-white shadow-lg`
                    : 'bg-white/70 text-gray-600 hover:bg-white shadow-md'
                }`}
                style={{ padding: '2px 8px 2px 8px' }}
              >
                Round {round}
              </button>
            ))}
            <button
              onClick={goToSummary}
              className={`px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 ${
                showSummary
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white/70 text-gray-600 hover:bg-white shadow-md'
              }`}
              style={{ padding: '2px 8px 2px 8px' }}
            >
              🏆 Summary
            </button>
          </div>
        </div>

        {/* Summary Page */}
        {showSummary ? (
          <>
            {/* Top 5 Leaderboard - Podium Style */}
            <div 
              className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-2xl shadow-2xl overflow-hidden relative"
              style={{ padding: '60px 40px 0px 40px'}}
            >
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
              </div>
              
              <h2 
                className="text-4xl font-extrabold text-white text-center drop-shadow-lg relative z-10 animate-bounce"
                style={{ marginBottom: '48px' }}
              >
                🏆 TOP 5 LEADERBOARD 🏆
              </h2>
              
              {/* Podium Layout: 4th - 2nd - 1st - 3rd - 5th */}
              <div className="flex items-end justify-center gap-3 md:gap-4 relative z-10">
                {/* 4th Place */}
                {rankings[3] && (
                  <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className={`w-20 md:w-28 p-4 md:p-5 rounded-2xl text-center transform hover:scale-110 transition-all duration-300 ${TOP_5_COLORS[3]}`}>
                      <div className="text-2xl md:text-3xl mb-1">⭐</div>
                      <div className="text-sm md:text-lg font-bold">#4</div>
                      <div className="text-xs md:text-sm font-semibold truncate">{rankings[3].name}</div>
                      <div className="text-lg md:text-2xl font-extrabold mt-1">{rankings[3].total}</div>
                    </div>
                    <div className="w-20 md:w-28 h-16 md:h-20 bg-gradient-to-t from-purple-700 to-purple-500 rounded-t-lg mt-2 flex items-center justify-center">
                      <span className="text-white font-bold text-lg md:text-xl">4th</span>
                    </div>
                  </div>
                )}

                {/* 2nd Place */}
                {rankings[1] && (
                  <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className={`w-24 md:w-32 p-5 md:p-6 rounded-2xl text-center transform hover:scale-110 transition-all duration-300 ${TOP_5_COLORS[1]}`}>
                      <div className="text-3xl md:text-4xl mb-1">🥈</div>
                      <div className="text-lg md:text-xl font-bold">#2</div>
                      <div className="text-sm md:text-base font-semibold truncate">{rankings[1].name}</div>
                      <div className="text-xl md:text-3xl font-extrabold mt-1">{rankings[1].total}</div>
                    </div>
                    <div className="w-24 md:w-32 h-24 md:h-32 bg-gradient-to-t from-gray-500 to-gray-300 rounded-t-lg mt-2 flex items-center justify-center">
                      <span className="text-white font-bold text-xl md:text-2xl">2nd</span>
                    </div>
                  </div>
                )}

                {/* 1st Place - Center & Tallest */}
                {rankings[0] && (
                  <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0s' }}>
                    <div className={`w-28 md:w-40 p-6 md:p-8 rounded-2xl text-center transform hover:scale-110 transition-all duration-300 shadow-2xl ring-4 ring-yellow-300/50 ${TOP_5_COLORS[0]}`}>
                      <div className="text-4xl md:text-5xl mb-2">🥇</div>
                      <div className="text-xl md:text-2xl font-bold">#1</div>
                      <div className="text-base md:text-lg font-semibold truncate">{rankings[0].name}</div>
                      <div className="text-2xl md:text-4xl font-extrabold mt-2">{rankings[0].total}</div>
                      <div className="text-xs opacity-80 mt-1">🎉 WINNER 🎉</div>
                    </div>
                    <div className="w-28 md:w-40 h-32 md:h-44 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg mt-2 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl md:text-3xl">1st</span>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {rankings[2] && (
                  <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className={`w-24 md:w-32 p-5 md:p-6 rounded-2xl text-center transform hover:scale-110 transition-all duration-300 ${TOP_5_COLORS[2]}`}>
                      <div className="text-3xl md:text-4xl mb-1">🥉</div>
                      <div className="text-lg md:text-xl font-bold">#3</div>
                      <div className="text-sm md:text-base font-semibold truncate">{rankings[2].name}</div>
                      <div className="text-xl md:text-3xl font-extrabold mt-1">{rankings[2].total}</div>
                    </div>
                    <div className="w-24 md:w-32 h-20 md:h-24 bg-gradient-to-t from-amber-700 to-amber-500 rounded-t-lg mt-2 flex items-center justify-center">
                      <span className="text-white font-bold text-xl md:text-2xl">3rd</span>
                    </div>
                  </div>
                )}

                {/* 5th Place */}
                {rankings[4] && (
                  <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <div className={`w-20 md:w-28 p-4 md:p-5 rounded-2xl text-center transform hover:scale-110 transition-all duration-300 ${TOP_5_COLORS[4]}`}>
                      <div className="text-2xl md:text-3xl mb-1">✨</div>
                      <div className="text-sm md:text-lg font-bold">#5</div>
                      <div className="text-xs md:text-sm font-semibold truncate">{rankings[4].name}</div>
                      <div className="text-lg md:text-2xl font-extrabold mt-1">{rankings[4].total}</div>
                    </div>
                    <div className="w-20 md:w-28 h-12 md:h-16 bg-gradient-to-t from-cyan-700 to-cyan-500 rounded-t-lg mt-2 flex items-center justify-center">
                      <span className="text-white font-bold text-lg md:text-xl">5th</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Full Rankings Table */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                📊 Full Rankings
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-100 to-pink-100">
                      <th className="p-4 text-center font-bold text-gray-700">Rank</th>
                      <th className="p-4 text-left font-bold text-gray-700">Player</th>
                      <th className="p-4 text-center font-bold text-indigo-600">Round 1</th>
                      <th className="p-4 text-center font-bold text-emerald-600">Round 2</th>
                      <th className="p-4 text-center font-bold text-orange-600">Round 3</th>
                      <th className="p-4 text-center font-bold text-purple-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((participant, rank) => (
                      <tr 
                        key={participant.index} 
                        className={`border-b transition-all ${
                          rank < 5 
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            rank === 0 ? 'bg-yellow-400 text-white' :
                            rank === 1 ? 'bg-gray-400 text-white' :
                            rank === 2 ? 'bg-amber-600 text-white' :
                            rank < 5 ? 'bg-purple-400 text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {rank + 1}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-gray-700">
                          {rank < 5 && <span className="mr-2">{rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '⭐'}</span>}
                          {participant.name}
                        </td>
                        <td className="p-3 text-center text-indigo-600 font-bold">{participant.round1}</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">{participant.round2}</td>
                        <td className="p-3 text-center text-orange-600 font-bold">{participant.round3}</td>
                        <td className="p-3 text-center text-purple-600 font-extrabold text-lg">{participant.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Round Chart */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 mb-8" style={{ height: '500px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>

            {/* Controls */}
            <div 
            className="flex justify-center gap-4 md:gap-6 mb-8 flex-wrap"
            style={{ paddingTop: '16px', paddingBottom: '16px' }}
            >
              <button
                onClick={prevRound}
                disabled={currentRound === 1}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold text-lg 
                         hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
                style={{ padding: '2px 8px 2px 8px' }}
              >
                ← Previous
              </button>
              <button
                onClick={nextRound}
                className={`px-6 py-3 bg-gradient-to-r ${ROUND_COLORS[currentRound].gradient} text-white rounded-xl font-bold text-lg 
                         transition-all shadow-lg hover:shadow-xl transform hover:scale-105`}
                style={{ padding: '2px 8px 2px 8px' }}
              >
                {currentRound === 3 ? '🏆 View Summary' : 'Next →'}
              </button>
              <button
                onClick={resetAll}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold text-lg 
                         hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ padding: '2px 8px 2px 8px' }}
              >
                🔄 Reset
              </button>
            </div>

            {/* Score Input Table */}
            <div 
            className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-5 md:p-10"
            style={{ padding: '20px' }}
            >
              {/* <h2 className={`text-xl font-bold mb-6 text-center bg-gradient-to-r ${ROUND_COLORS[currentRound].gradient} bg-clip-text text-transparent`}>
                ✏️ Score Input - Round {currentRound}
              </h2> */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-5 md:gap-6">
                {participants.map((name, index) => (
                  <div 
                    key={index} 
                    className={`p-5 md:p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                      currentRound === 1 ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50' :
                      currentRound === 2 ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50' :
                      'border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50'
                    }`}
                  >
                    {editingName === index ? (
                      <input
                        type="text"
                        defaultValue={name}
                        className="w-full text-center font-bold text-gray-700 mb-2 p-1 border rounded"
                        onBlur={(e) => updateParticipantName(index, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && updateParticipantName(index, e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="text-center font-bold text-gray-700 mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                        onClick={() => setEditingName(index)}
                        title="Click to edit name"
                      >
                        {name}
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => incrementScore(index, -10)}
                        className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 text-white rounded-lg font-bold hover:from-red-500 hover:to-red-600 text-xs shadow-md"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => incrementScore(index, -1)}
                        className="w-7 h-8 bg-gradient-to-br from-red-300 to-red-400 text-white rounded-lg font-bold hover:from-red-400 hover:to-red-500 shadow-md"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={scores[currentRound][index]}
                        onChange={(e) => updateScore(index, e.target.value)}
                        className="w-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg p-1 focus:border-indigo-400 focus:outline-none"
                        min="0"
                      />
                      <button
                        onClick={() => incrementScore(index, 1)}
                        className="w-7 h-8 bg-gradient-to-br from-green-400 to-green-500 text-white rounded-lg font-bold hover:from-green-500 hover:to-green-600 shadow-md"
                      >
                        +
                      </button>
                      <button
                        onClick={() => incrementScore(index, 10)}
                        className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 text-xs shadow-md"
                      >
                        +10
                      </button>
                    </div>
                    <div className="text-center mt-2 text-sm text-gray-500">
                      Total: <span className="font-bold text-purple-600">{totalScores[index]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-10 mb-4 text-gray-500 text-sm"
        style={{ paddingTop: '16px'}}
        >
          💡 Click on player name to edit
        </div>
      </div>
    </div>
  )
}

export default App
