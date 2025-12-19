import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function GradeSubmissionPage() {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()
  const { data: submission } = useSWR(
    id && session?.user?.role === 'TEACHER' ? `/api/teacher/grading/${id}` : null,
    fetcher
  )

  const [grades, setGrades] = useState({})
  const [feedback, setFeedback] = useState({})
  const [overallFeedback, setOverallFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  if (!session || session.user.role !== 'TEACHER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Access denied</p>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!initialized && submission.answers) {
    const initialGrades = {}
    const initialFeedback = {}
    submission.answers.forEach(answer => {
      initialGrades[answer.id] = answer.points !== null ? answer.points : 0
      initialFeedback[answer.id] = answer.feedback || ''
    })
    setGrades(initialGrades)
    setFeedback(initialFeedback)
    setOverallFeedback(submission.feedback || '')
    setInitialized(true)
  }

  const handleGradeChange = (answerId, value) => {
    const newGrades = {...grades}
    newGrades[answerId] = parseInt(value) || 0
    setGrades(newGrades)
  }

  const handleFeedbackChange = (answerId, value) => {
    const newFeedback = {...feedback}
    newFeedback[answerId] = value
    setFeedback(newFeedback)
  }

  const handleSubmitGrades = async () => {
    setLoading(true)

    const answerGrades = []
    for (const answerId in grades) {
      answerGrades.push({
        id: answerId,
        points: grades[answerId],
        feedback: feedback[answerId] || null
      })
    }

    try {
      const res = await fetch(`/api/teacher/grading/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answerGrades,
          overallFeedback: overallFeedback || null
        })
      })

      if (res.ok) {
        alert('Submission graded successfully!')
        router.push('/teacher/grading')
      } else {
        alert('Failed to grade submission')
      }
    } catch (error) {
      alert('Error grading submission')
    }
    setLoading(false)
  }

  let totalPoints = 0
  let earnedPoints = 0
  submission.answers.forEach(answer => {
    totalPoints += answer.question.points
    earnedPoints += grades[answer.id] || 0
  })
  const totalScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/teacher/grading">
            <span className="text-blue-600 hover:underline cursor-pointer">← Back</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2">STUDENT</h3>
              <div className="font-bold text-lg">{submission.user.name || 'Anonymous'}</div>
              <div className="text-sm text-gray-600">{submission.user.email}</div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2">QUIZ</h3>
              <div className="font-bold text-lg">{submission.quiz.title}</div>
              <div className="text-sm text-gray-600">
                {submission.quiz.lesson.module.course.title}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <span className="font-bold">Projected Score:</span>
              <div className="text-4xl font-bold text-blue-600">{totalScore}%</div>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-6">
          {submission.answers.map((answer, index) => (
            <div key={answer.id} className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">Question {index + 1}</h3>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                  {answer.question.type}
                </span>
                <span className="text-sm text-gray-600">
                  Max: {answer.question.points} points
                </span>
                <p className="text-gray-700 mt-2">{answer.question.text}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-sm mb-2">STUDENT ANSWER:</h4>
                
                {answer.question.type === 'MCQ' && (
                  <div>
                    {answer.question.answers.map((opt) => (
                      <div key={opt.id} className="p-2 mb-2 border rounded">
                        {answer.selectedAnswerId === opt.id && <span className="font-bold">→ </span>}
                        {opt.text}
                        {opt.isCorrect && <span className="ml-2 text-green-600">✓</span>}
                      </div>
                    ))}
                    <p className="text-sm mt-2">
                      Auto-graded: {answer.points} / {answer.question.points} points
                    </p>
                  </div>
                )}

                {answer.question.type === 'TEXT' && (
                  <div className="bg-white p-4 rounded border">
                    <p>{answer.answerText || '(No answer)'}</p>
                  </div>
                )}

                {answer.question.type === 'FILE_UPLOAD' && (
                  <div>
                    {answer.fileUrl ? (
                      <a href={answer.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                        Download File
                      </a>
                    ) : (
                      <p>(No file)</p>
                    )}
                  </div>
                )}
              </div>

              {answer.question.type !== 'MCQ' && (
                <div className="border-t pt-4">
                  <div className="mb-4">
                    <label className="block font-bold mb-2">Points:</label>
                    <input
                      type="number"
                      min="0"
                      max={answer.question.points}
                      value={grades[answer.id] || 0}
                      onChange={(e) => handleGradeChange(answer.id, e.target.value)}
                      className="w-full border rounded px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Feedback:</label>
                    <textarea
                      value={feedback[answer.id] || ''}
                      onChange={(e) => handleFeedbackChange(answer.id, e.target.value)}
                      className="w-full border rounded px-4 py-2"
                      rows="3"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Overall Feedback</h3>
          <textarea
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            className="w-full border rounded px-4 py-3"
            rows="4"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSubmitGrades}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-4 rounded-lg font-bold disabled:bg-gray-400"
          >
            Submit Grades
          </button>
          <button
            onClick={() => router.push('/teacher/grading')}
            className="px-8 bg-gray-200 py-4 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}