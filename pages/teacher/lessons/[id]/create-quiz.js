import { useState } from 'react'
import { useRouter } from 'next/router'

export default function CreateQuizPage() {
  const router = useRouter()
  const { id } = router.query
  
  const [quiz, setQuiz] = useState({
    title: '',
    duration: ''
  })
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)

  const addQuestion = (type = 'MCQ') => {
    const newQuestion = {
      text: '',
      type: type,
      points: 1
    }

    if (type === 'MCQ') {
      newQuestion.options = ['', '', '', '']
      newQuestion.correctOption = 0
    }

    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...questions]
    updated[index][field] = value
    setQuestions(updated)
  }

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions]
    updated[qIndex].options[oIndex] = value
    setQuestions(updated)
  }

  const changeQuestionType = (index, newType) => {
    const updated = [...questions]
    updated[index].type = newType
    
    if (newType === 'MCQ') {
      updated[index].options = ['', '', '', '']
      updated[index].correctOption = 0
    } else {
      delete updated[index].options
      delete updated[index].correctOption
    }
    
    setQuestions(updated)
  }

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const saveQuiz = async () => {
    if (!quiz.title) {
      alert('Please enter a quiz title')
      return
    }

    if (questions.length === 0) {
      alert('Please add at least one question')
      return
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) {
        alert(`Question ${i + 1} is missing text`)
        return
      }
      if (q.type === 'MCQ') {
        if (q.options.some(opt => !opt.trim())) {
          alert(`Question ${i + 1} has empty options`)
          return
        }
      }
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/teacher/lessons/${id}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quiz.title,
          duration: quiz.duration ? parseInt(quiz.duration) : null,
          questions
        })
      })

      if (res.ok) {
        alert('Quiz created successfully!')
        router.back()
      } else {
        const error = await res.json()
        alert('Failed: ' + (error.message || 'Unknown error'))
      }
    } catch (error) {
      console.error(error)
      alert('Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => router.back()} className="text-blue-600 hover:underline mb-4">
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-8">Create Quiz</h1>

        {/* Quiz Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Quiz Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Title *</label>
              <input
                type="text"
                value={quiz.title}
                onChange={e => setQuiz({...quiz, title: e.target.value})}
                className="w-full border rounded px-4 py-2"
                placeholder="e.g., Chapter 1 Quiz"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={quiz.duration}
                onChange={e => setQuiz({...quiz, duration: e.target.value})}
                className="w-full border rounded px-4 py-2"
                placeholder="Leave empty for no time limit"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Questions</h2>
            <div className="flex gap-2">
              <button
                onClick={() => addQuestion('MCQ')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + MCQ
              </button>
              <button
                onClick={() => addQuestion('TEXT')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                + Text Answer
              </button>
              <button
                onClick={() => addQuestion('FILE_UPLOAD')}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                + File Upload
              </button>
            </div>
          </div>

          {questions.length === 0 && (
            <p className="text-gray-500 text-center py-8">No questions added yet. Click a button above to add questions.</p>
          )}

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="border rounded p-4 mb-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold">Question {qIndex + 1}</h3>
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Type</label>
                    <select
                      value={q.type}
                      onChange={e => changeQuestionType(qIndex, e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="MCQ">Multiple Choice (MCQ)</option>
                      <option value="TEXT">Text Answer (Essay/Short Answer)</option>
                      <option value="FILE_UPLOAD">File Upload</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Points</label>
                    <input
                      type="number"
                      value={q.points}
                      onChange={e => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Question Text *</label>
                  <textarea
                    value={q.text}
                    onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    rows="2"
                    placeholder="Enter your question..."
                  />
                </div>

                {/* MCQ Options */}
                {q.type === 'MCQ' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Options (select the correct answer)</label>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name={'correct-' + qIndex}
                          checked={q.correctOption === oIndex}
                          onChange={() => updateQuestion(qIndex, 'correctOption', oIndex)}
                          className="mt-1"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                          className="flex-1 border rounded px-3 py-2"
                          placeholder={'Option ' + (oIndex + 1)}
                        />
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 mt-1">
                      ✓ MCQ questions will be auto-graded
                    </p>
                  </div>
                )}

                {/* Text Answer Instructions */}
                {q.type === 'TEXT' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-yellow-800">
                      📝 <strong>Text Answer:</strong> Student will type their answer. Teacher must manually grade this question.
                    </p>
                  </div>
                )}

                {/* File Upload Instructions */}
                {q.type === 'FILE_UPLOAD' && (
                  <div className="bg-purple-50 border border-purple-200 rounded p-3">
                    <p className="text-sm text-purple-800">
                      📎 <strong>File Upload:</strong> Student will upload a file. Teacher must manually grade this question.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={saveQuiz}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}