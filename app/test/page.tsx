export default function TestPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Tailwind CSS v4 Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <p className="text-gray-900">Gray background test</p>
        </div>
        
        <div className="p-4 bg-brand text-white rounded">
          <p>Brand color test</p>
        </div>
        
        <div className="p-4 bg-primary text-white rounded">
          <p>Primary color test</p>
        </div>
        
        <div className="p-4 bg-success text-white rounded">
          <p>Success color test</p>
        </div>
        
        <div className="p-4 border-2 border-gray-300 rounded">
          <p className="text-secondary">Secondary text color test</p>
        </div>
        
        <button className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
          Orange button test
        </button>
      </div>
    </div>
  )
}