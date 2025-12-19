import Link from 'next/link'
import useSWR from 'swr'
import CourseCard from '../components/CourseCard'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function Home() {
  const { data, error } = useSWR('/api/courses', fetcher)
  
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">Education Portal</h1>
      <p className="mb-6">Explore courses and start learning.</p>
      
      <div className="grid gap-4">
        {!data && <div>Loading courses...</div>}
        {data?.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      
      <div className="mt-8">
        <Link href="/courses" className="text-blue-600">
          View all courses →
        </Link>
      </div>
    </div>
  )
}