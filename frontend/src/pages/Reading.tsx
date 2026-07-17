import React, { useState } from 'react'
import {
  BookOpen,
  Trash2,
  Award,
  FileText,
  Calendar,
  BookmarkCheck
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { useToastStore } from '../stores/toastStore'

interface ReadingNote {
  id: string
  date: string
  content: string
}

interface Quote {
  id: string
  bookTitle: string
  text: string
}

interface Book {
  id: string
  title: string
  author: string
  totalPages: number
  currentPage: number
  category: 'fiction' | 'non-fiction' | 'biography' | 'science' | 'business'
  status: 'reading' | 'to_read' | 'completed'
  notes: ReadingNote[]
}

export const Reading: React.FC = () => {
  const { addToast } = useToastStore()

  // Seed Books
  const [books, setBooks] = useState<Book[]>([
    {
      id: 'b-1',
      title: 'Atomic Habits',
      author: 'James Clear',
      totalPages: 320,
      currentPage: 145,
      category: 'non-fiction',
      status: 'reading',
      notes: [
        { id: 'rn-1-1', date: '2026-07-15', content: 'Loved the concept of 1% better every day. Small changes compound massively.' }
      ]
    },
    {
      id: 'b-2',
      title: 'Zero to One',
      author: 'Peter Thiel',
      totalPages: 224,
      currentPage: 224,
      category: 'business',
      status: 'completed',
      notes: [
        { id: 'rn-2-1', date: '2026-07-10', content: 'Thiels focus on building monopolies and avoiding standard competition is key.' }
      ]
    },
    {
      id: 'b-3',
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      totalPages: 512,
      currentPage: 0,
      category: 'science',
      status: 'to_read',
      notes: []
    }
  ])

  // Seed Quotes
  const [quotes, setQuotes] = useState<Quote[]>([
    { id: 'q-1', bookTitle: 'Atomic Habits', text: 'You do not rise to the level of your goals. You fall to the level of your systems.' },
    { id: 'q-2', bookTitle: 'Zero to One', text: 'What important truth do very few people agree with you on?' }
  ])

  // Reading Goals
  const [yearlyGoal] = useState({ target: 12, completed: 3 }) // 3 completed books
  const [readingStreak] = useState(14) // 14 days

  // Modals States
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)

  // Book Form Fields
  const [formTitle, setFormTitle] = useState('')
  const [formAuthor, setFormAuthor] = useState('')
  const [formTotalPages, setFormTotalPages] = useState('')
  const [formCurrentPage, setFormCurrentPage] = useState('0')
  const [formCategory, setFormCategory] = useState<Book['category']>('non-fiction')
  const [formStatus, setFormStatus] = useState<Book['status']>('to_read')

  // Progress Update Fields (Inside details modal)
  const [updatePageNum, setUpdatePageNum] = useState('')
  const [newNoteText, setNewNoteText] = useState('')

  // Quote Form Fields
  const [qBookTitle, setQBookTitle] = useState('Atomic Habits')
  const [qText, setQText] = useState('')

  // Selected Book reference
  const selectedBook = books.find((b) => b.id === selectedBookId)

  // Analytics Calculations
  const totalCompletedBooks = books.filter((b) => b.status === 'completed').length
  const totalPagesRead = books.reduce((acc, b) => acc + b.currentPage, 0)
  const goalProgressPercent = Math.round(((totalCompletedBooks + yearlyGoal.completed) / yearlyGoal.target) * 100)

  // Handlers
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault()
    const totalPagesNum = parseInt(formTotalPages)
    const currentPageNum = parseInt(formCurrentPage)

    if (!formTitle.trim() || !formAuthor.trim() || isNaN(totalPagesNum) || totalPagesNum <= 0) {
      addToast('Please enter a valid title, author, and page count', 'warning')
      return
    }

    const newBook: Book = {
      id: `b-${Math.random().toString(36).substr(2, 9)}`,
      title: formTitle,
      author: formAuthor,
      totalPages: totalPagesNum,
      currentPage: isNaN(currentPageNum) ? 0 : Math.min(totalPagesNum, currentPageNum),
      category: formCategory,
      status: formStatus,
      notes: []
    }

    setBooks([...books, newBook])
    addToast('Book added to library shelf!', 'success')
    setIsBookModalOpen(false)

    // Reset Form
    setFormTitle('')
    setFormAuthor('')
    setFormTotalPages('')
    setFormCurrentPage('0')
  }

  const handleUpdateProgress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBook) return

    const pageNum = parseInt(updatePageNum)
    if (isNaN(pageNum) || pageNum < 0 || pageNum > selectedBook.totalPages) {
      addToast(`Please enter a valid page number (0 - ${selectedBook.totalPages})`, 'warning')
      return
    }

    const isNowCompleted = pageNum === selectedBook.totalPages
    const newStatus: Book['status'] = isNowCompleted
      ? 'completed'
      : pageNum > 0
      ? 'reading'
      : selectedBook.status

    const updatedNotes = [...selectedBook.notes]
    if (newNoteText.trim()) {
      updatedNotes.push({
        id: `rn-${Math.random()}`,
        date: new Date().toISOString().split('T')[0],
        content: newNoteText.trim()
      })
    }

    setBooks(
      books.map((b) =>
        b.id === selectedBook.id
          ? {
              ...b,
              currentPage: pageNum,
              status: newStatus,
              notes: updatedNotes
            }
          : b
      )
    )

    if (isNowCompleted && selectedBook.status !== 'completed') {
      addToast(`🎉 Completed reading "${selectedBook.title}"! Goal updated.`, 'success')
    } else {
      addToast('Reading progress logged!', 'success')
    }

    setNewNoteText('')
    setIsDetailsModalOpen(false)
  }

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!qText.trim()) {
      addToast('Quote text is required', 'warning')
      return
    }

    const newQuote: Quote = {
      id: `q-${Math.random().toString(36).substr(2, 9)}`,
      bookTitle: qBookTitle,
      text: qText.trim()
    }

    setQuotes([...quotes, newQuote])
    addToast('Quote added to your board!', 'success')
    setIsQuoteModalOpen(false)
    setQText('')
  }

  const handleDeleteBook = (id: string) => {
    setBooks(books.filter((b) => b.id !== id))
    addToast('Book removed from library', 'error')
    setIsDetailsModalOpen(false)
  }

  const handleDeleteQuote = (id: string) => {
    setQuotes(quotes.filter((q) => q.id !== id))
    addToast('Quote deleted', 'error')
  }

  const getBookProgressPercent = (b: Book) => {
    return Math.round((b.currentPage / b.totalPages) * 100)
  }

  // Category tags style mapping
  const categoryStyles = {
    fiction: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'non-fiction': 'bg-sky-50 text-sky-700 border-sky-200',
    biography: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    science: 'bg-purple-50 text-purple-700 border-purple-200',
    business: 'bg-pink-50 text-pink-700 border-pink-200'
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Reading Tracker 📚
          </h1>
          <p className="text-slate-500 mt-1">Manage books library, quotes board, and progress notes.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsQuoteModalOpen(true)} variant="secondary" size="sm">
            + Log Quote
          </Button>
          <Button onClick={() => setIsBookModalOpen(true)} size="sm">
            + Add Book
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Books Completed', value: totalCompletedBooks, icon: <BookmarkCheck className="text-indigo-500" size={16} /> },
          { label: 'Total Pages Read', value: totalPagesRead, icon: <BookOpen className="text-emerald-500" size={16} /> },
          { label: 'Annual Goal Progress', value: `${totalCompletedBooks + yearlyGoal.completed}/${yearlyGoal.target}`, icon: <Award className="text-sky-500" size={16} /> },
          { label: 'Reading Streak', value: `${readingStreak} days`, icon: <Calendar className="text-pink-500" size={16} /> }
        ].map((stat, idx) => (
          <Card key={idx} variant="white" className="flex items-center gap-4 p-4 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-lg font-black text-slate-800 mt-0.5">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Goals & Quotes Panel */}
        <div className="space-y-6">
          {/* Yearly Goal progress */}
          <Card variant="white" className="space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Award className="text-sky-500 animate-pulse" /> 2026 Reading Target
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Goal Progress</span>
                <span>{goalProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-400 h-2 rounded-full"
                  style={{ width: `${goalProgressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                You have completed {totalCompletedBooks + yearlyGoal.completed} out of {yearlyGoal.target} books target this year.
              </p>
            </div>
          </Card>

          {/* Quotes board list */}
          <Card variant="white" className="space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              Favorite Quotes Board
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
              {quotes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 italic">No quotes saved.</p>
              ) : (
                quotes.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl relative space-y-2 group">
                    <p className="text-xs text-slate-700 italic font-medium leading-relaxed pr-6">
                      "{q.text}"
                    </p>
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                      <span>— {q.bookTitle}</span>
                      <button
                        onClick={() => handleDeleteQuote(q.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right main shelf book list grid */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="white" className="space-y-4">
            <h2 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Library Bookshelf</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {books.map((b) => {
                const percent = getBookProgressPercent(b)
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBookId(b.id)
                      setUpdatePageNum(String(b.currentPage))
                      setIsDetailsModalOpen(true)
                    }}
                    className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-3xl cursor-pointer transition-all flex gap-4 items-center group relative overflow-hidden"
                  >
                    {/* Fake book cover placeholder icon */}
                    <div className="w-14 h-20 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xl font-black shrink-0 shadow-xs border border-white">
                      {b.title[0]}
                    </div>

                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="space-y-0.5">
                        <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-extrabold uppercase border ${categoryStyles[b.category]}`}>
                          {b.category}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-xs truncate mt-1 leading-snug group-hover:text-sky-600 transition-colors">
                          {b.title}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-semibold truncate">by {b.author}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] text-slate-400 font-black uppercase">
                          <span>Progress</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-200/50 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${
                              b.status === 'completed' ? 'bg-emerald-400' : 'bg-sky-400'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Book details & log progress Dialog Modal */}
      <Dialog
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={selectedBook ? `"${selectedBook.title}" Details` : 'Book Details'}
        footer={
          <div className="flex justify-between w-full">
            <Button
              variant="danger"
              onClick={() => selectedBookId && handleDeleteBook(selectedBookId)}
            >
              Remove Book
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsDetailsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateProgress} variant="primary">Save Updates</Button>
            </div>
          </div>
        }
      >
        {selectedBook && (
          <form onSubmit={handleUpdateProgress} className="space-y-5">
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Author</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedBook.author}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Category</p>
                <p className="text-xs font-bold text-slate-700 capitalize mt-0.5">{selectedBook.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={`Current Page (Total: ${selectedBook.totalPages})`}
                placeholder="120"
                value={updatePageNum}
                onChange={(e) => setUpdatePageNum(e.target.value)}
              />
              <div className="flex flex-col justify-end min-h-[40px] text-[10px] font-bold text-slate-500">
                <span>Completed: {getBookProgressPercent(selectedBook)}%</span>
                <span className="text-slate-400 mt-0.5">Pages remaining: {selectedBook.totalPages - selectedBook.currentPage}</span>
              </div>
            </div>

            {/* Reading notes */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500">Write Reading Note (Optional)</label>
              <textarea
                placeholder="Add thoughts, key take-aways, or quotes..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 transition-all text-slate-800 h-16 resize-none"
              />
            </div>

            {/* Logged notes list */}
            {selectedBook.notes.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <FileText size={10} /> Saved Book Notes
                </h4>
                <div className="space-y-2 max-h-28 overflow-y-auto scrollbar-thin">
                  {selectedBook.notes.map((note) => (
                    <div key={note.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <p className="text-[8px] text-slate-400 font-black">{note.date}</p>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}
      </Dialog>

      {/* Add Book Modal */}
      <Dialog
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Add Book to Library 📚"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsBookModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBook} variant="primary">Add Book</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveBook} className="space-y-4">
          <Input
            label="Book Title"
            placeholder="Atomic Habits, Sapiens..."
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
          <Input
            label="Author Name"
            placeholder="James Clear..."
            value={formAuthor}
            onChange={(e) => setFormAuthor(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Page Count"
              placeholder="320"
              value={formTotalPages}
              onChange={(e) => setFormTotalPages(e.target.value)}
            />
            <Input
              label="Current Page (Start)"
              placeholder="0"
              value={formCurrentPage}
              onChange={(e) => setFormCurrentPage(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as any)}
              options={[
                { value: 'fiction', label: 'Fiction' },
                { value: 'non-fiction', label: 'Non-Fiction' },
                { value: 'biography', label: 'Biography' },
                { value: 'science', label: 'Science & Technology' },
                { value: 'business', label: 'Business & Finance' }
              ]}
            />
            <Select
              label="Shelving Status"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              options={[
                { value: 'to_read', label: 'To Read (Backlog)' },
                { value: 'reading', label: 'Active Reading' },
                { value: 'completed', label: 'Completed Shelf' }
              ]}
            />
          </div>
        </form>
      </Dialog>

      {/* Log Quote Modal */}
      <Dialog
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title="Log Favorite Quote ✍️"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsQuoteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddQuote} variant="primary">Log Quote</Button>
          </div>
        }
      >
        <form onSubmit={handleAddQuote} className="space-y-4">
          <Select
            label="Select Book Reference"
            value={qBookTitle}
            onChange={(e) => setQBookTitle(e.target.value)}
            options={books.map((b) => ({ value: b.title, label: b.title }))}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Quote Text</label>
            <textarea
              placeholder="Enter quote sentence..."
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 transition-all text-slate-800 h-24 resize-none leading-relaxed"
            />
          </div>
        </form>
      </Dialog>
    </div>
  )
}
