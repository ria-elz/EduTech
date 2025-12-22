import { useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then((r) => r.json())

export default function CoursePage() {
  const router = useRouter()
  const { slug } = router.query
  const { data: session } = useSession()

  const { data: course } = useSWR(slug ? `/api/courses/${slug}` : null, fetcher)
  const { data: reviews, mutate: mutateReviews } = useSWR(
    slug ? `/api/courses/${slug}/review` : null,
    fetcher
  )
  const { data: announcements, mutate: mutateAnnouncements } = useSWR(
    slug ? `/api/courses/${slug}/announcements` : null,
    fetcher
  )

  const [enrolling, setEnrolling] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementContent, setAnnouncementContent] = useState('')
  const [postingAnnouncement, setPostingAnnouncement] = useState(false)

  const enrolled = course?.enrollments?.some(e => e.userId === session?.user?.id) || false

  const handleEnroll = async () => {
    if (!session) {
      alert('Please sign in to enroll')
      return
    }

    setEnrolling(true)
    const res = await fetch('/api/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: course.id })
    })
    setEnrolling(false)

    if (res.ok) {
      alert('Enrolled successfully!')
      router.reload()
    } else {
      const data = await res.json()
      alert(data.message || 'Failed to enroll')
    }
  }

  const submitReview = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/courses/${slug}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      })

      if (res.ok) {
        alert('Review submitted successfully!')
        setShowReviewForm(false)
        setComment('')
        mutateReviews()
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to submit review')
      }
    } catch (error) {
      alert('Error submitting review')
    } finally {
      setSubmitting(false)
    }
  }

  const submitAnnouncement = async () => {
    setPostingAnnouncement(true)
    try {
      const res = await fetch(`/api/courses/${slug}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: announcementTitle, 
          content: announcementContent 
        })
      })

      if (res.ok) {
        alert('Announcement posted successfully!')
        setShowAnnouncementForm(false)
        setAnnouncementTitle('')
        setAnnouncementContent('')
        mutateAnnouncements()
      } else {
        const data = await res.json()
        alert(data.message || 'Failed to post announcement')
      }
    } catch (error) {
      alert('Error posting announcement')
    } finally {
      setPostingAnnouncement(false)
    }
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading course...</p>
        </div>
      </div>
    )
  }

  const isTeacher = session?.user?.role === 'TEACHER' && course.author.id === session.user.id

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-xl text-blue-100 mb-6">{course.description}</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              👤 {course.author.name || 'Instructor'}
            </span>
            <span className="flex items-center gap-2">
              📚 {course.modules?.length || 0} modules
            </span>
            <span className="flex items-center gap-2">
              👥 {course.enrollments?.length || 0} students
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {!enrolled && !isTeacher && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold mb-2">Ready to start learning?</h2>
                <p className="text-gray-600">Enroll now to access all course content</p>
              </div>
              <button
                onClick={handleEnroll}
                disabled={enrolling || !session}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold disabled:bg-gray-400"
              >
                {enrolling ? 'Enrolling...' : session ? 'Enroll Now' : 'Sign In to Enroll'}
              </button>
            </div>
          </div>
        )}

        {enrolled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">
              ✓ You are enrolled in this course
            </p>
          </div>
        )}

        {isTeacher && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-semibold">
              👨‍🏫 You are the instructor of this course
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">Course Content</h2>

          {course.modules && course.modules.length > 0 ? (
            <div className="space-y-4">
              {course.modules.map((module, index) => (
                <div key={module.id} className="border rounded-lg">
                  <div className="bg-gray-50 p-4 font-semibold">
                    Module {index + 1}: {module.title}
                  </div>
                  <div className="p-4">
                    {module.lessons && module.lessons.length > 0 ? (
                      <ul className="space-y-2">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">📄</span>
                              {enrolled || isTeacher ? (
                                <Link
                                  href={'/lesson/' + lesson.id}
                                  className="text-blue-600 hover:underline"
                                >
                                  {lesson.title}
                                </Link>
                              ) : (
                                <span className="text-gray-600">{lesson.title}</span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {lesson.videoUrl && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  🎥 Video
                                </span>
                              )}
                              {lesson.pdfUrl && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  📄 PDF
                                </span>
                              )}
                              {lesson.audioUrl && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  🎵 Audio
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No lessons yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No modules available yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">📢 Announcements</h2>
            {isTeacher && (
              <button
                onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
              >
                {showAnnouncementForm ? 'Cancel' : '+ New Announcement'}
              </button>
            )}
          </div>

          {showAnnouncementForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold mb-4">Post New Announcement</h3>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Announcement title..."
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold mb-2">Message</label>
                <textarea
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  className="w-full border rounded-lg px-4 py-3"
                  rows="4"
                  placeholder="Announcement message..."
                />
              </div>

              <button
                onClick={submitAnnouncement}
                disabled={postingAnnouncement || !announcementTitle || !announcementContent}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400"
              >
                {postingAnnouncement ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          )}

          {announcements && announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{announcement.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap mb-3">{announcement.content}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>👨‍🏫</span>
                    <span>{announcement.author.name || 'Instructor'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No announcements yet
            </p>
          )}
        </div>

        {enrolled && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
              >
                {showReviewForm ? 'Cancel' : 'Write Review'}
              </button>
            </div>

            {showReviewForm && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-bold mb-4">Your Review</h3>
                
                <div className="mb-4">
                  <label className="block font-semibold mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-3xl focus:outline-none"
                      >
                        {star <= rating ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block font-semibold mb-2">Comment (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3"
                    rows="4"
                    placeholder="Share your experience..."
                  />
                </div>

                <button
                  onClick={submitReview}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}

            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {review.user.name ? review.user.name[0].toUpperCase() : '?'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{review.user.name || 'Anonymous'}</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-yellow-500">
                              {star <= review.rating ? '⭐' : '☆'}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 ml-13">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}