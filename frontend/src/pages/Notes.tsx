import React, { useState } from 'react'
import {
  Plus,
  Search,
  Pin,
  Folder,
  FileText,
  Clock,
  ChevronLeft,
  Save,
  Edit3,
  Eye,
  Copy
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { useToastStore } from '../stores/toastStore'

interface NoteVersion {
  timestamp: string
  content: string
}

interface Note {
  id: string
  title: string
  content: string
  folder: string
  tags: string[]
  pinned: boolean
  updatedAt: string
  versions: NoteVersion[]
}

export const Notes: React.FC = () => {
  const { addToast } = useToastStore()

  const [folders, setFolders] = useState<string[]>(['All Notes', 'Work', 'Ideas', 'Personal'])
  const [activeFolder, setActiveFolder] = useState('All Notes')
  const [newFolderName, setNewFolderName] = useState('')

  // Seed Notes
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 'note-1',
      title: 'SoloLife UI Design Guidelines',
      content: `# Design System tokens\n\n**Colors**:\n- Soft White\n- Light Blue\n- Lavender\n\n\`\`\`css\n/* Primary variables */\n:root {\n  --color-sky-light: #f0f9ff;\n  --color-pink-light: #fdf2f8;\n}\n\`\`\`\n\nEnjoy writing clean UI code!`,
      folder: 'Work',
      tags: ['Design', 'CSS'],
      pinned: true,
      updatedAt: new Date().toLocaleString(),
      versions: [
        { timestamp: new Date(Date.now() - 600000).toLocaleString(), content: '# Draft system tokens' },
        { timestamp: new Date().toLocaleString(), content: `# Design System tokens\n\n**Colors**:\n- Soft White\n- Light Blue\n- Lavender\n\n\`\`\`css\n/* Primary variables */\n:root {\n  --color-sky-light: #f0f9ff;\n  --color-pink-light: #fdf2f8;\n}\n\`\`\`\n\nEnjoy writing clean UI code!` }
      ]
    },
    {
      id: 'note-2',
      title: 'Ideas for next SaaS product',
      content: `### Micro-SaaS ideas\n\n1. AI-driven Pomodoro companion\n2. Real-time developer log exporter\n3. Ambient music tracker dashboard\n\n![Mockup reference](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60)`,
      folder: 'Ideas',
      tags: ['Business', 'AI'],
      pinned: false,
      updatedAt: new Date(Date.now() - 3600000).toLocaleString(),
      versions: [
        { timestamp: new Date(Date.now() - 3600000).toLocaleString(), content: '### Micro-SaaS ideas' }
      ]
    },
    {
      id: 'note-3',
      title: 'Quick Grocery Checklist',
      content: `* Organic Almond milk\n* Ground coffee (medium roast)\n* Weekly eggs and avocados`,
      folder: 'Personal',
      tags: ['Chores'],
      pinned: false,
      updatedAt: new Date(Date.now() - 7200000).toLocaleString(),
      versions: []
    }
  ])

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('sololifeos_quick_notes')
      if (stored) {
        const quickNotes = JSON.parse(stored) as Note[]
        if (quickNotes.length > 0) {
          setNotes(prev => [...quickNotes, ...prev])
          localStorage.removeItem('sololifeos_quick_notes')
          addToast(`Imported ${quickNotes.length} quick-added notes!`, 'success')
        }
      }
    } catch {}
  }, [addToast])

  // Selected Note Editor State
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [editorTitle, setEditorTitle] = useState('')
  const [editorContent, setEditorContent] = useState('')
  const [editorFolder, setEditorFolder] = useState('Personal')
  const [editorTagsStr, setEditorTagsStr] = useState('')
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit')
  const [historyOpen, setHistoryOpen] = useState(false)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')

  // Selected Note Ref
  const selectedNote = notes.find((n) => n.id === selectedNoteId)

  // Filtered Notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFolder = activeFolder === 'All Notes' || n.folder === activeFolder
    return matchesSearch && matchesFolder
  })

  const pinnedNotes = filteredNotes.filter((n) => n.pinned)
  const unpinnedNotes = filteredNotes.filter((n) => !n.pinned)

  // Folders and tags lists
  const handleAddFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName.trim())) {
      setFolders([...folders, newFolderName.trim()])
      setNewFolderName('')
      addToast('New folder created!', 'success')
    }
  }

  // Edit Handlers
  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id)
    setEditorTitle(note.title)
    setEditorContent(note.content)
    setEditorFolder(note.folder)
    setEditorTagsStr(note.tags.join(', '))
    setEditorMode('edit')
    setHistoryOpen(false)
  }

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Untitled Note',
      content: '',
      folder: activeFolder === 'All Notes' ? 'Personal' : activeFolder,
      tags: [],
      pinned: false,
      updatedAt: new Date().toLocaleString(),
      versions: []
    }
    setNotes([newNote, ...notes])
    handleSelectNote(newNote)
    addToast('Blank note created', 'success')
  }

  const handleSaveNote = () => {
    if (!editorTitle.trim()) {
      addToast('Note title is required', 'warning')
      return
    }

    const tags = editorTagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const updatedNotes = notes.map((n) => {
      if (n.id === selectedNoteId) {
        // Save version history if content changed
        const hasContentChanged = n.content !== editorContent
        const timestamp = new Date().toLocaleString()
        const versions = hasContentChanged
          ? [...n.versions, { timestamp, content: editorContent }]
          : n.versions

        return {
          ...n,
          title: editorTitle,
          content: editorContent,
          folder: editorFolder,
          tags,
          updatedAt: timestamp,
          versions
        }
      }
      return n
    })

    setNotes(updatedNotes)
    addToast('Note saved successfully!', 'success')
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id))
    addToast('Note deleted', 'error')
    setSelectedNoteId(null)
  }

  const togglePin = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotes(
      notes.map((n) => (n.id === note.id ? { ...n, pinned: !n.pinned } : n))
    )
    addToast(note.pinned ? 'Note unpinned' : 'Note pinned to top!', 'success')
  }

  const restoreVersion = (version: NoteVersion) => {
    setEditorContent(version.content)
    addToast('Note content restored to selected revision!', 'info')
  }

  // Simple Markdown Parser Simulation
  const renderMarkdown = (text: string) => {
    if (!text.trim()) return <p className="text-slate-400 italic">Empty note. Start writing...</p>

    const lines = text.split('\n')
    let inCodeBlock = false
    let codeContent: string[] = []

    return (
      <div className="space-y-4 text-slate-700 leading-relaxed max-w-none text-sm font-medium">
        {lines.map((line, idx) => {
          // Code block toggles
          if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
              inCodeBlock = false
              const contentToRender = codeContent.join('\n')
              codeContent = []
              return (
                <div key={`code-${idx}`} className="relative bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800">
                  <div className="absolute right-3 top-3 opacity-60 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(contentToRender)
                        addToast('Code copied to clipboard!', 'success')
                      }}
                      className="p-1 cursor-pointer"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  <pre>{contentToRender}</pre>
                </div>
              )
            } else {
              inCodeBlock = true
              return null
            }
          }

          if (inCodeBlock) {
            codeContent.push(line)
            return null
          }

          // Headers
          if (line.startsWith('# ')) {
            return <h1 key={idx} className="text-xl font-black text-slate-800 tracking-tight pt-2">{line.substring(2)}</h1>
          }
          if (line.startsWith('## ')) {
            return <h2 key={idx} className="text-lg font-extrabold text-slate-800 tracking-tight pt-2">{line.substring(3)}</h2>
          }
          if (line.startsWith('### ')) {
            return <h3 key={idx} className="text-base font-bold text-slate-800 tracking-tight pt-1">{line.substring(4)}</h3>
          }

          // Image renders
          const imgRegex = /!\[(.*?)\]\((.*?)\)/
          const imgMatch = line.match(imgRegex)
          if (imgMatch) {
            return (
              <div key={idx} className="my-3 overflow-hidden rounded-2xl border border-slate-100 max-w-md">
                <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full h-auto object-cover max-h-52" />
                <span className="text-[10px] text-slate-400 block text-center py-1 font-semibold">{imgMatch[1]}</span>
              </div>
            )
          }

          // Lists
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <ul key={idx} className="list-disc pl-6 space-y-1 font-medium">
                <li>{line.substring(2)}</li>
              </ul>
            )
          }
          if (line.trim().match(/^\d+\.\s/)) {
            const listText = line.replace(/^\d+\.\s/, '')
            return (
              <ol key={idx} className="list-decimal pl-6 space-y-1 font-medium">
                <li>{listText}</li>
              </ol>
            )
          }

          // Line Break helper
          if (line.trim() === '') {
            return <div key={idx} className="h-2" />
          }

          // General text containing bold syntax
          return (
            <p key={idx} className="leading-relaxed">
              {line.split('**').map((part, i) => {
                if (i % 2 === 1) {
                  return <strong key={i} className="font-extrabold text-slate-800">{part}</strong>
                }
                return part
              })}
            </p>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start max-w-6xl mx-auto pb-12">
      {/* Folders List Left Panel */}
      <div className="space-y-6">
        <Card variant="white" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Folder className="text-sky-500 w-5 h-5 shrink-0" />
            <h2 className="font-bold text-slate-800 text-sm">Notes Folders</h2>
          </div>

          <div className="space-y-1.5">
            {folders.map((f) => {
              const isSelected = activeFolder === f
              const count = f === 'All Notes' ? notes.length : notes.filter((n) => n.folder === f).length
              return (
                <div
                  key={f}
                  onClick={() => {
                    setActiveFolder(f)
                    setSelectedNoteId(null)
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected ? 'bg-sky-50 text-sky-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{f}</span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-sm shadow-xs">{count}</span>
                </div>
              )
            })}
          </div>

          {/* New folder creation */}
          <div className="flex gap-1.5 pt-2 border-t border-slate-100">
            <input
              type="text"
              placeholder="New folder..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
            />
            <Button onClick={handleAddFolder} size="sm" className="px-2 shrink-0">
              Create
            </Button>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3">
        {selectedNoteId ? (
          /* Rich Text / Markdown Editor View */
          <Card variant="white" className="space-y-4 min-h-[500px] flex flex-col justify-between">
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Toolbar Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                <button
                  onClick={() => setSelectedNoteId(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Notes Grid</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-slate-100 p-0.5 rounded-xl">
                    <button
                      onClick={() => setEditorMode('edit')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        editorMode === 'edit' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      <Edit3 size={10} /> Edit
                    </button>
                    <button
                      onClick={() => setEditorMode('preview')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        editorMode === 'preview' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      <Eye size={10} /> Preview
                    </button>
                  </div>

                  <button
                    onClick={() => setHistoryOpen(!historyOpen)}
                    className={`p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer relative ${
                      historyOpen ? 'bg-slate-50 ring-2 ring-slate-200' : ''
                    }`}
                    title="Version Revisions History"
                  >
                    <Clock size={14} className="text-slate-600" />
                  </button>

                  <Button onClick={handleSaveNote} size="sm" className="flex items-center gap-1">
                    <Save size={12} /> Save
                  </Button>
                </div>
              </div>

              {/* Main Workspace with History Panel Split */}
              <div className="flex-1 flex gap-4">
                {/* Editor or Preview Area */}
                <div className="flex-1 flex flex-col gap-4">
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    placeholder="Note Title..."
                    className="w-full text-lg font-black text-slate-800 border-none focus:outline-hidden placeholder-slate-300"
                  />

                  {editorMode === 'edit' ? (
                    <div className="flex-1 flex flex-col">
                      <textarea
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                        placeholder="Write markdown here: Use # Headers, - Lists, ```css Codeblocks..."
                        className="w-full flex-1 min-h-[350px] p-4 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-700 font-mono resize-none leading-relaxed"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 p-4 bg-slate-50/20 border border-slate-100 rounded-2xl min-h-[350px] overflow-y-auto max-h-[500px]">
                      {renderMarkdown(editorContent)}
                    </div>
                  )}
                </div>

                {/* Revisions History Panel */}
                {historyOpen && (
                  <div className="w-56 border-l border-slate-100 pl-4 shrink-0 space-y-4">
                    <h3 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-500" /> Note Revisions
                    </h3>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin pr-1">
                      {selectedNote?.versions.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic text-center py-6">No past revisions saved.</p>
                      ) : (
                        selectedNote?.versions.map((ver, idx) => (
                          <div
                            key={idx}
                            onClick={() => restoreVersion(ver)}
                            className="p-2 bg-slate-50 border border-slate-200/50 hover:bg-slate-100/50 hover:border-slate-300 rounded-lg cursor-pointer transition-all space-y-1"
                          >
                            <p className="text-[9px] text-slate-500 font-black">Rev #{idx + 1}</p>
                            <p className="text-[8px] text-slate-400 font-medium leading-tight">{ver.timestamp}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Editor Bottom Settings */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 mt-4">
                <Select
                  label="Select Folder"
                  value={editorFolder}
                  onChange={(e) => setEditorFolder(e.target.value)}
                  options={folders.filter((f) => f !== 'All Notes').map((f) => ({ value: f, label: f }))}
                />

                <Input
                  label="Tags (comma-separated)"
                  value={editorTagsStr}
                  onChange={(e) => setEditorTagsStr(e.target.value)}
                  placeholder="Design, Draft, SaaS"
                />
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-4">
              <span className="text-[10px] text-slate-400 font-semibold">
                Saved: {selectedNote?.updatedAt}
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => selectedNoteId && handleDeleteNote(selectedNoteId)}
              >
                Delete Note
              </Button>
            </div>
          </Card>
        ) : (
          /* Notes Grid List View */
          <div className="space-y-6">
            {/* Search toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-slate-100">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search notes content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
                />
              </div>

              <Button onClick={handleCreateNote}>
                <Plus size={14} className="mr-1" /> New Note
              </Button>
            </div>

            {/* Empty notes fallback */}
            {filteredNotes.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-3xl space-y-4 border border-slate-100 min-h-[300px] flex flex-col justify-center items-center">
                <FileText className="text-slate-300 w-12 h-12" />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-sm">No notes found</h3>
                  <p className="text-xs text-slate-400">Try changing folders or search query.</p>
                </div>
                <Button onClick={handleCreateNote} size="sm">
                  Create First Note
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pinned Section */}
                {pinnedNotes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Pin size={12} className="rotate-45" /> Pinned Notes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pinnedNotes.map((note) => (
                        <Card
                          key={note.id}
                          onClick={() => handleSelectNote(note)}
                          variant="glass-pink"
                          className="cursor-pointer border border-pink-200/40 hover:shadow-xs transition-shadow flex flex-col justify-between h-44 relative overflow-hidden group"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="font-extrabold text-slate-800 text-xs truncate leading-snug">
                                {note.title}
                              </h4>
                              <button
                                onClick={(e) => togglePin(note, e)}
                                className="text-pink-500 hover:text-slate-400 cursor-pointer shrink-0"
                              >
                                <Pin size={12} className="rotate-45" />
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">
                              {note.content.replace(/[#*`!\[\]\(\)]/g, '')}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between border-t border-slate-100/50 pt-2.5 mt-3 text-[8px] font-extrabold uppercase tracking-wide">
                            <div className="flex flex-wrap gap-1">
                              {note.tags.map((t) => (
                                <span key={t} className="bg-white/60 text-slate-600 border border-slate-200/20 px-1.5 py-0.5 rounded-sm">
                                  {t}
                                </span>
                              ))}
                            </div>
                            <span className="text-slate-400">{note.updatedAt.split(',')[0]}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* General Section */}
                <div className="space-y-3">
                  {pinnedNotes.length > 0 && (
                    <h3 className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={12} /> Notes Checklist
                    </h3>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {unpinnedNotes.map((note) => (
                      <Card
                        key={note.id}
                        onClick={() => handleSelectNote(note)}
                        variant="white"
                        className="cursor-pointer border border-slate-200/50 hover:shadow-xs transition-shadow flex flex-col justify-between h-44 relative overflow-hidden group"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="font-extrabold text-slate-800 text-xs truncate leading-snug">
                              {note.title}
                            </h4>
                            <button
                              onClick={(e) => togglePin(note, e)}
                              className="text-slate-300 hover:text-pink-500 cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Pin size={12} className="rotate-45" />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">
                            {note.content.replace(/[#*`!\[\]\(\)]/g, '')}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between border-t border-slate-50 pt-2.5 mt-3 text-[8px] font-extrabold uppercase tracking-wide">
                          <div className="flex flex-wrap gap-1">
                            {note.tags.map((t) => (
                              <span key={t} className="bg-slate-50 text-slate-500 border border-slate-100 px-1.5 py-0.5 rounded-sm">
                                  {t}
                                </span>
                            ))}
                          </div>
                          <span className="text-slate-400">{note.updatedAt.split(',')[0]}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
