'use client'
import { useState } from 'react'

export default function SearchPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])

    const handleSearch = async () => {
        const res = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        })
        const data = await res.json()
        setResults(data.results || [])
    }

    return (
        <div className="p-4">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="例：給付金 住宅支援"
                className="border p-2 rounded"
            />
            <button onClick={handleSearch} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
                検索
            </button>

            <div className="mt-4">
                {results.map((item, i) => (
                    <div key={i} className="border-b py-2">
                        <p>{item.document?.derivedStructData?.title || 'No title'}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
