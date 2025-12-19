import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function SubmissionDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()
  const { data: submission } = useSWR(
    id && session ? `/api/student/submission/${id}` : null,
    fetcher
  )

  if (!session) {
    return <div className="p-8">Please sign in</div>
  }

  if (!submission) {
    return <div className="p-8">Loading...</div>
  }

  const isPending = submission.status === 'PENDING'
  const isGraded = submission.status === 'GRADED'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/my-marks">
            <span className="text-blue-600 hover:underline cursor-pointer">Back</span>
          </Link>
        </div>

        <div className="bg-blue-500 text-white rounded-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">{submission.quiz.title}</h1>
          <p>Submitted: {new Date(submission.createdAt).toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Your Score</h2>
          
          {isPending && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-yellow-800">Being reviewed by teacher</p>
            </div>
          )}

          {isGraded && (
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-4">
                {submission.score}%
              </div>
              {submission.feedback && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-4">
                  <h3 className="font-bold mb-2">Teacher Feedback:</h3>
                  <p>{submission.feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {isGraded && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Questions</h2>
            
            {submission.answers.map((answer, index) => {
              const question = answer.question
              const points = answer.points || 0
              const maxPoints = question.points
              const isMCQ = question.type === 'MCQ'
              const isTEXT = question.type === 'TEXT'
              const isFILE = question.type === 'FILE_UPLOAD'

              return (
                <div key={answer.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">Question {index + 1}</h3>
                      <p className="text-gray-700">{question.text}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {points}/{maxPoints}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-sm mb-2">YOUR ANSWER:</h4>
                    
                    {isMCQ && (
                      <div className="space-y-2">
                        {question.answers.map((opt) => {
                          const selected = answer.selectedAnswerId === opt.id
                          const correct = opt.isCorrect
                          
                          return (
                            <div key={opt.id} className="p-3 border rounded">
                              {selected && <span className="font-bold mr-2">→</span>}
                              <span>{opt.text}</span>
                              {correct && <span className="ml-2 text-green-600">✓</span>}
                              {selected && !correct && <span className="ml-2 text-red-600">✗</span>}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {isTEXT && (
                      <div className="bg-white p-4 border rounded">
                        <p>{answer.answerText || 'No answer'}</p>
                      </div>
                    )}

                    {isFILE && (
                      <div>
                        {answer.fileUrl ? (
                          <a href={answer.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                            View File
                          </a>
                        ) : (
                          <p>No file</p>
                        )}
                      </div>
                    )}
                  </div>

                  {answer.feedback && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                      <h4 className="font-bold text-sm mb-2">FEEDBACK:</h4>
                      <p>{answer.feedback}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}