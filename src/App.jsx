import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const INITIAL_PARTICIPANTS = [
  'Peserta 1',
  'Peserta 2',
  'Peserta 3',
  'Peserta 4',
  'Peserta 5',
  'Peserta 6',
  'Peserta 7',
  'Peserta 8',
  'Peserta 9',
  'Peserta 10',
]

const ROUND_COLORS = {
  1: { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' },
  2: { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgb(16, 185, 129)' },
  3: { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgb(245, 158, 11)' },
}

function App() {
  const [currentRound, setCurrentRound] = useState(1)
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS)
  const [scores, setScores] = useState({
    1: Array(10).fill(0),
    2: Array(10).fill(0),
    3: Array(10).fill(0),
  })
  const [editingName, setEditingName] = useState(null)

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('quizScoreboard')
    if (savedData) {
      const { participants: savedParticipants, scores: savedScores, currentRound: savedRound } = JSON.parse(savedData)
      if (savedParticipants) setParticipants(savedParticipants)
      if (savedScores) setScores(savedScores)
      if (savedRound) setCurrentRound(savedRound)
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('quizScoreboard', JSON.stringify({ participants, scores, currentRound }))
  }, [participants, scores, currentRound])

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
    if (currentRound < 3) {
      setCurrentRound(currentRound + 1)
    }
  }

  const prevRound = () => {
    if (currentRound > 1) {
      setCurrentRound(currentRound - 1)
    }
  }

  const resetAll = () => {
    if (confirm('Apakah Anda yakin ingin reset semua data?')) {
      setScores({
        1: Array(10).fill(0),
        2: Array(10).fill(0),
        3: Array(10).fill(0),
      })
      setCurrentRound(1)
      setParticipants(INITIAL_PARTICIPANTS)
      localStorage.removeItem('quizScoreboard')
    }
  }

  const getTotalScores = () => {
    return participants.map((_, i) => 
      scores[1][i] + scores[2][i] + scores[3][i]
    )
  }

  const chartData = {
    labels: participants,
    datasets: [
      {
        label: 'Ronde 1',
        data: scores[1],
        backgroundColor: ROUND_COLORS[1].bg,
        borderColor: ROUND_COLORS[1].border,
        borderWidth: 2,
      },
      {
        label: 'Ronde 2',
        data: scores[2],
        backgroundColor: ROUND_COLORS[2].bg,
        borderColor: ROUND_COLORS[2].border,
        borderWidth: 2,
      },
      {
        label: 'Ronde 3',
        data: scores[3],
        backgroundColor: ROUND_COLORS[3].bg,
        borderColor: ROUND_COLORS[3].border,
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14, weight: 'bold' },
          color: '#374151',
        },
      },
      title: {
        display: true,
        text: 'Scoreboard Quiz - Semua Ronde',
        font: { size: 24, weight: 'bold' },
        color: '#1f2937',
        padding: 20,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Quiz Scoreboard
          </h1>
          <div className="flex items-center justify-center gap-4">
            <span className={`px-4 py-2 rounded-full text-white font-bold text-lg ${
              currentRound === 1 ? 'bg-blue-500' : 
              currentRound === 2 ? 'bg-emerald-500' : 'bg-amber-500'
            }`}>
              Ronde {currentRound} dari 3
            </span>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6" style={{ height: '450px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={prevRound}
            disabled={currentRound === 1}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold text-lg 
                     hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all shadow-lg hover:shadow-xl"
          >
            ← Ronde Sebelumnya
          </button>
          <button
            onClick={nextRound}
            disabled={currentRound === 3}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-lg 
                     hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all shadow-lg hover:shadow-xl"
          >
            Ronde Berikutnya →
          </button>
          <button
            onClick={resetAll}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-lg 
                     hover:bg-red-600 transition-all shadow-lg hover:shadow-xl"
          >
            Reset Semua
          </button>
        </div>

        {/* Score Input Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Input Score - Ronde {currentRound}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {participants.map((name, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-xl border-2 ${
                  currentRound === 1 ? 'border-blue-200 bg-blue-50' :
                  currentRound === 2 ? 'border-emerald-200 bg-emerald-50' :
                  'border-amber-200 bg-amber-50'
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
                    className="text-center font-bold text-gray-700 mb-2 cursor-pointer hover:text-indigo-600"
                    onClick={() => setEditingName(index)}
                    title="Klik untuk edit nama"
                  >
                    {name}
                  </div>
                )}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => incrementScore(index, -10)}
                    className="w-8 h-8 bg-red-400 text-white rounded-lg font-bold hover:bg-red-500 text-sm"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => incrementScore(index, -1)}
                    className="w-8 h-8 bg-red-300 text-white rounded-lg font-bold hover:bg-red-400"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={scores[currentRound][index]}
                    onChange={(e) => updateScore(index, e.target.value)}
                    className="w-16 text-center text-xl font-bold border-2 border-gray-300 rounded-lg p-1"
                    min="0"
                  />
                  <button
                    onClick={() => incrementScore(index, 1)}
                    className="w-8 h-8 bg-green-400 text-white rounded-lg font-bold hover:bg-green-500"
                  >
                    +
                  </button>
                  <button
                    onClick={() => incrementScore(index, 10)}
                    className="w-8 h-8 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 text-sm"
                  >
                    +10
                  </button>
                </div>
                <div className="text-center mt-2 text-sm text-gray-500">
                  Total: <span className="font-bold text-gray-700">{totalScores[index]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Rangkuman Score
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-bold text-gray-700">Peserta</th>
                  <th className="p-3 text-center font-bold text-blue-600">Ronde 1</th>
                  <th className="p-3 text-center font-bold text-emerald-600">Ronde 2</th>
                  <th className="p-3 text-center font-bold text-amber-600">Ronde 3</th>
                  <th className="p-3 text-center font-bold text-purple-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((name, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold text-gray-700">{name}</td>
                    <td className="p-3 text-center text-blue-600 font-bold">{scores[1][index]}</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">{scores[2][index]}</td>
                    <td className="p-3 text-center text-amber-600 font-bold">{scores[3][index]}</td>
                    <td className="p-3 text-center text-purple-600 font-bold text-lg">{totalScores[index]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
