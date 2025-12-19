import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function QuizPage() {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()
  const { data: quiz } = useSWR(id ? `/api/quizzes/${id}` : null, fetcher)
  
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (quiz && quiz.duration) {
      setTimeLeft(quiz.duration * 60)
    }
  }, [quiz])

  useEffect(() => {
    if (!timeLeft || timeLeft <= 0 || submitted) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, submitted])

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleSubmit = async () => {
  if (submitted) return
  setSubmitted(true)

  try {
    const res = await fetch(`/api/quizzes/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    })

    if (res.ok) {
      const data = await res.json()
      setResult(data)
    } else {
      const errorData = await res.json()
      console.error('Submit error:', errorData)
      alert('Failed to submit quiz: ' + (errorData.details || errorData.error))
      setSubmitted(false)
    }
  } catch (error) {
    console.error('Submit error:', error)
    alert('Error submitting quiz: ' + error.message)
    setSubmitted(false)
  }
}

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins + ':' + (secs < 10 ? '0' : '') + secs
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Please sign in to take this quiz</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading quiz...</p>
      </div>
    )
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {result.needsManualGrading ? (
              <>
                <div className="text-6xl mb-4">📝</div>
                <h1 className="text-3xl font-bold mb-4">Quiz Submitted!</h1>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <p className="text-yellow-800 text-lg">
                    Your submission is pending review by the teacher.
                    You'll be notified once it's graded.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">
                  {result.score >= 70 ? '🎉' : result.score >= 50 ? '👍' : '📚'}
                </div>
                <h1 className="text-3xl font-bold mb-4">Quiz Completed!</h1>
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {result.score}%
                </div>
                <p className="text-gray-600 mb-8">
                  You scored {result.score} out of 100
                </p>
              </>
            )}
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.questions ? quiz.questions.length : 0} questions</p>
            </div>
            {timeLeft && (
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-gray-600">Time Remaining</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {quiz.questions && quiz.questions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">Question {index + 1}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {q.type}
                  </span>
                  <span className="text-sm text-gray-600">
                    {q.points} {q.points === 1 ? 'point' : 'points'}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{q.text}</p>

              {/* MCQ Type */}
              {q.type === 'MCQ' && q.answers && (
                <div className="space-y-2">
                  {q.answers.map((answer) => (
                    <label 
                      key={answer.id} 
                      className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={'q' + q.id}
                        value={answer.id}
                        checked={answers[q.id] === answer.id}
                        onChange={() => handleAnswerChange(q.id, answer.id)}
                        className="mr-3"
                      />
                      <span>{answer.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* TEXT Type */}
              {q.type === 'TEXT' && (
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="6"
                  placeholder="Type your answer here..."
                />
              )}

              {/* FILE_UPLOAD Type */}
              {q.type === 'FILE_UPLOAD' && (
                <div>
                  <input
                    type="file"
                    onChange={(e) => handleAnswerChange(q.id, e.target.files[0])}
                    className="w-full border rounded-lg px-4 py-3"
                  />
                  {answers[q.id] && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ File selected: {answers[q.id].name}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={submitted}
            className="bg-green-600 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
          >
            {submitted ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  )
}