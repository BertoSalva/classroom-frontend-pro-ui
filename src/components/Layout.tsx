import React, { createContext, useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export const SearchContext = createContext<{ searchQuery: string; setSearchQuery: (q: string) => void }>({
  searchQuery: '',
  setSearchQuery: () => {},
})

export default function Layout({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
          <Topbar />
          <div className="content">{children}</div>
        </SearchContext.Provider>
      </main>
    </div>
  )
}
