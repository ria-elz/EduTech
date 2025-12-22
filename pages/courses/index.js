import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url) => fetch(url).then((r) => r.json())

const categories = [
  { value: 'All', label: 'All Categories', icon: '📚' },
  { value: 'Programming', label: 'Programming', icon: '💻' },
  { value: 'Design', label: 'Design', icon: '🎨' },
  { value: 'Business', label: 'Business', icon: '💼' },
  { value: 'Marketing', label: 'Marketing', icon: '📈' },
  { value: 'Mathematics', label: 'Mathematics', icon: '🔢' },
  { value: 'Science', label: 'Science', icon: '🔬' },
  { value: 'Language', label: 'Language', icon: '🌍' },
  { value: 'Music', label: 'Music', icon: '🎵' },
  { value: 'Health', label: 'Health & Fitness', icon: '❤️' },
  { value: 'Other', label: 'Other', icon: '📖' }
]

export default function CoursesPage() {
  const { data: courses } = useSWR('/api/courses', fetcher)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  if (!courses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    )
  }

  // Filter courses
  const filteredCourses = courses.filter(course => {
    // Category filter
    const courseCategory = course.category || 'Other'
    const matchesCategory = selectedCategory === 'All' || courseCategory === selectedCategory
    
    // Search filter
    let matchesSearch = true
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.trim().toLowerCase()
      const title = course.title ? course.title.toLowerCase() : ''
      const desc = course.description ? course.description.toLowerCase() : ''
      matchesSearch = title.indexOf(query) >= 0 || desc.indexOf(query) >= 0
    }
    
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Courses</h1>
          <p className="text-gray-600">Discover and enroll in courses to start learning</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="mb-6">
            <label className="block font-semibold mb-2">🔍 Search Courses</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-3">📁 Filter by Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={
                    selectedCategory === cat.value
                      ? 'px-4 py-2 rounded-lg font-medium bg-blue-600 text-white transition-colors'
                      : 'px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors'
                  }
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">No Courses Found</h2>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search or filter'
                : 'Check back later for new courses!'}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4 text-gray-600">
              Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const lessonCount = course.lessonCount || 0
                const studentCount = course.enrollments?.length || 0
                const avgRating = course.avgRating || 0
                const totalRatings = course.totalRatings || 0
                const hasRatings = totalRatings > 0
                const courseCategory = course.category || 'Other'
                const categoryObj = categories.find(c => c.value === courseCategory)

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                      <span className="inline-block bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {categoryObj?.icon || '📚'} {courseCategory}
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3 h-20">
                        {course.description || 'No description available'}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          👤 {course.author.name || 'Instructor'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          📚 {lessonCount} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          👥 {studentCount} students
                        </span>
                      </div>

                      {hasRatings ? (
                        <div className="flex items-center gap-2 pt-3 border-t mb-4">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-yellow-500 text-lg">
                                {star <= Math.round(avgRating) ? '⭐' : '☆'}
                              </span>
                            ))}
                          </div>
                          <span className="font-bold text-gray-700">{avgRating}</span>
                          <span className="text-gray-500 text-sm">
                            ({totalRatings} {totalRatings === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      ) : (
                        <div className="pt-3 border-t mb-4">
                          <p className="text-sm text-gray-400">No reviews yet</p>
                        </div>
                      )}

                      <Link
                        href={'/course/' + course.slug}
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold transition-colors"
                      >
                        View Course →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}