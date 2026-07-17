import React from 'react'

interface TableProps {
  headers: string[]
  children: React.ReactNode
}

export const Table: React.FC<TableProps> = ({ headers, children }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/50 bg-white">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/75 border-b border-slate-200/50">
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4 font-bold text-slate-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-600">
          {children}
        </tbody>
      </table>
    </div>
  )
}
