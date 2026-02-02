import React from 'react'
export default function Index() {
  return (
    <main className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to the application</h2>
            <p className="text-gray-600">
              Use the forms in the sidebar to run specific searches in the system.
              Results will appear in this main area.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Instructions:</h3>
              <ul className="list-disc list-inside text-blue-600 mt-2">
                <li>Select between Search by Article and Search by Authors in the sidebar</li>
                <li>Fill in the filters as needed</li>
                <li>Click "Search" to run the query</li>
                <li>Use "Clear" to reset the filters</li>
              </ul>
            </div>
          </div>
        </main>
  );
}