import { useState } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function ModulePage() {
  const router = useRouter()
  const { id } = router.query
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)

  const { data: module, mutate } = useSWR(
    () => id ? `/api/teacher/modules/${id}` : null,
    fetcher
  )

  if (!module) return <div className="p-8">Loading...</div>

  const addLesson = async () => {
    if (!lessonTitle.trim()) {
      alert('Please enter a lesson title')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('title', lessonTitle)
      formData.append('content', lessonContent)
      formData.append('videoUrl', videoUrl)
      
      if (pdfFile) {
        formData.append('pdf', pdfFile)
      }
      if (audioFile) {
        formData.append('audio', audioFile)
      }

      const res = await fetch(`/api/teacher/modules/${id}/lessons`, {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        setLessonTitle('')
        setLessonContent('')
        setVideoUrl('')
        setPdfFile(null)
        setAudioFile(null)
        mutate()
        alert('Lesson added successfully!')
      } else {
        const error = await res.json()
        alert('Failed to add lesson: ' + (error.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to add lesson')
    } finally {
      setUploading(false)
    }
  }

  const startEditing = (lesson) => {
    setEditingLesson({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      pdfUrl: lesson.pdfUrl,
      audioUrl: lesson.audioUrl,
      newPdf: null,
      newAudio: null
    })
  }

  const cancelEditing = () => {
    setEditingLesson(null)
  }

  const updateLesson = async () => {
    if (!editingLesson.title.trim()) {
      alert('Please enter a lesson title')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('title', editingLesson.title)
      formData.append('content', editingLesson.content)
      formData.append('videoUrl', editingLesson.videoUrl)
      
      if (editingLesson.newPdf) {
        formData.append('pdf', editingLesson.newPdf)
      }
      if (editingLesson.newAudio) {
        formData.append('audio', editingLesson.newAudio)
      }

      const res = await fetch(`/api/teacher/lessons/${editingLesson.id}`, {
        method: 'PUT',
        body: formData
      })

      if (res.ok) {
        setEditingLesson(null)
        mutate()
        alert('Lesson updated successfully!')
      } else {
        const error = await res.json()
        alert('Failed to update lesson: ' + (error.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update lesson')
    } finally {
      setUploading(false)
    }
  }

  const deleteFile = async (lessonId, fileType) => {
    if (!confirm(`Delete this ${fileType}?`)) return

    const res = await fetch(`/api/teacher/lessons/${lessonId}/delete-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileType })
    })

    if (res.ok) {
      mutate()
      if (editingLesson && editingLesson.id === lessonId) {
        setEditingLesson({
          ...editingLesson,
          [fileType + 'Url']: null
        })
      }
      alert(`${fileType} deleted successfully`)
    } else {
      alert(`Failed to delete ${fileType}`)
    }
  }

  const deleteLesson = async (lessonId, lessonTitle) => {
    if (!confirm(`Delete lesson "${lessonTitle}"? This will delete all uploaded files.`)) return

    const res = await fetch(`/api/teacher/lessons/${lessonId}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      mutate()
      alert('Lesson deleted successfully')
    } else {
      alert('Failed to delete lesson')
    }
  }

  return (
    
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Module Header */}
        <div className="mb-8">
          <Link 
            href={`/teacher/courses/${module.courseId}`}
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Course
          </Link>
          <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
          <p className="text-gray-600">Module {module.position}</p>
        </div>

        {/* Add Lesson Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 mb-8 border border-green-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📝 Add New Lesson</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lesson Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Introduction to Variables"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lesson Content (Text)
              </label>
              <textarea
                placeholder="Write your lesson content here..."
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                rows="6"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎥 Video URL (YouTube, Vimeo, etc.)
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📄 PDF Document
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {pdfFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Selected: {pdfFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎵 Audio File
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files[0])}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {audioFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Selected: {audioFile.name}
                </p>
              )}
            </div>

            <button
              onClick={addLesson}
              disabled={uploading}
              className={`w-full px-8 py-3 rounded-lg font-semibold transition-colors shadow-md ${
                uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {uploading ? 'Uploading...' : 'Add Lesson'}
            </button>
          </div>
        </div>

        {/* Lessons List */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📚 Lessons</h2>
          
          {(!module.lessons || module.lessons.length === 0) && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg">No lessons yet. Add your first lesson above!</p>
            </div>
          )}
          
          <div className="space-y-4">
            {module.lessons?.map((lesson, index) => (
              <div key={lesson.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                {editingLesson && editingLesson.id === lesson.id ? (
                  // EDIT MODE
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">Edit Lesson {index + 1}</h3>
                      <button
                        onClick={cancelEditing}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  {/* Add Quiz Button */}
<Link
  href={`/teacher/lessons/${lesson.id}/create-quiz`}
  className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold transition-colors ml-4"
>
  {lesson.quiz ? '✏️ Edit Quiz' : '➕ Create Quiz'}
</Link>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Title *</label>
                      <input
                        type="text"
                        value={editingLesson.title}
                        onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Content</label>
                      <textarea
                        value={editingLesson.content}
                        onChange={(e) => setEditingLesson({...editingLesson, content: e.target.value})}
                        rows="5"
                        className="w-full border rounded-lg px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Video URL</label>
                      <input
                        type="url"
                        value={editingLesson.videoUrl}
                        onChange={(e) => setEditingLesson({...editingLesson, videoUrl: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2"
                      />
                    </div>

                    {/* Current PDF */}
                    {editingLesson.pdfUrl && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">📄 Current PDF</p>
                          <a href={editingLesson.pdfUrl} target="_blank" className="text-blue-600 text-sm hover:underline">
                            View PDF
                          </a>
                        </div>
                        <button
                          onClick={() => deleteFile(lesson.id, 'pdf')}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    {/* New PDF */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        {editingLesson.pdfUrl ? 'Replace PDF' : 'Upload PDF'}
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setEditingLesson({...editingLesson, newPdf: e.target.files[0]})}
                        className="w-full border rounded-lg px-4 py-2"
                      />
                      {editingLesson.newPdf && (
                        <p className="text-sm text-green-600 mt-1">✓ {editingLesson.newPdf.name}</p>
                      )}
                    </div>

                    {/* Current Audio */}
                    {editingLesson.audioUrl && (
                      <div className="bg-purple-50 border border-purple-200 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold">🎵 Current Audio</p>
                          <button
                            onClick={() => deleteFile(lesson.id, 'audio')}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                        <audio controls className="w-full">
                          <source src={editingLesson.audioUrl} />
                        </audio>
                      </div>
                    )}

                    {/* New Audio */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        {editingLesson.audioUrl ? 'Replace Audio' : 'Upload Audio'}
                      </label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setEditingLesson({...editingLesson, newAudio: e.target.files[0]})}
                        className="w-full border rounded-lg px-4 py-2"
                      />
                      {editingLesson.newAudio && (
                        <p className="text-sm text-green-600 mt-1">✓ {editingLesson.newAudio.name}</p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={updateLesson}
                        disabled={uploading}
                        className={`flex-1 py-2 rounded-lg font-semibold ${
                          uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {uploading ? 'Updating...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => deleteLesson(lesson.id, lesson.title)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
                      >
                        Delete Lesson
                      </button>
                    </div>
                  </div>
                ) : (
                  // VIEW MODE
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                        Lesson {index + 1}
                      </span>
                      <h3 className="text-xl font-bold text-gray-800">{lesson.title}</h3>
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      {lesson.videoUrl && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">🎥 Video</span>
                      )}
                      {lesson.pdfUrl && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">📄 PDF</span>
                      )}
                      {lesson.audioUrl && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">🎵 Audio</span>
                      )}
                    </div>

                    {lesson.content && (
                      <p className="text-gray-600 text-sm mb-3">
                        {lesson.content.substring(0, 150)}...
                      </p>
                    )}
                    
                    <button
                      onClick={() => startEditing(lesson)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      ✏️ Edit Lesson
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    
  )
}