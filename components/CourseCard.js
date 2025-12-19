import Link from 'next/link'

export default function CourseCard({ course }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100">
      {/* Card Header with gradient */}
      <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      
      <div className="p-6">
        {/* Course Title */}
        <Link 
          href={`/courses/${course.slug}`} 
          className="block mb-3 group-hover:text-blue-600 transition-colors"
        >
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
        </Link>
        
        {/* Course Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        {/* Author and Date */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {course.author?.name?.charAt(0) || 'A'}
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {course.author?.name || 'Anonymous'}
            </span>
          </div>
          
          {course.createdAt && (
            <span className="text-xs text-gray-500">
              {new Date(course.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          )}
        </div>
        
        {/* View Course Button */}
        <Link
          href={`/courses/${course.slug}`}
          className="mt-4 block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          View Course →
        </Link>
      </div>
    </div>
  )
}