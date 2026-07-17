import { useEffect, useState } from 'react'
import Header from './components/Header/Header.jsx'
import Body from './components/body/Body.jsx'
import {
  createDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from './api/document.api.js'
import { useAuth } from './context/AuthContext.jsx'
import { useMode } from './context/useMode.js'

import './App.css'

function App() {
  const { isDark } = useMode()
  const { accessToken, user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [error, setError] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')

  useEffect(() => {
    if (!accessToken) return

    listDocuments(accessToken)
      .then(({ documents }) => setDocuments(documents))
      .catch((err) => setError(err.message))
  }, [accessToken])

  const openDocument = async (id) => {
    setError('')
    const { document } = await getDocument(accessToken, id)
    setSelectedDocument(document)
    setTitleDraft(document.title)
  }

  const addDocument = async () => {
    setError('')
    const { document } = await createDocument(accessToken)
    setDocuments((current) => [document, ...current])
    setSelectedDocument(document)
    setTitleDraft(document.title)
  }

  const startRename = () => {
    setTitleDraft(selectedDocument.title)
    setIsRenaming(true)
  }

  const saveTitle = async () => {
    const title = titleDraft.trim()
    if (!title || title === selectedDocument.title) {
      setIsRenaming(false)
      return
    }

    try {
      setError('')
      const { document } = await updateDocument(
        accessToken,
        selectedDocument.id,
        { title },
      )

      setSelectedDocument((current) => ({ ...current, ...document }))
      setDocuments((current) =>
        current.map((item) =>
          item.id === document.id ? { ...item, ...document } : item
        )
      )
      setIsRenaming(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleTitleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      await saveTitle()
    }

    if (event.key === 'Escape') {
      setIsRenaming(false)
      setTitleDraft(selectedDocument.title)
    }
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-950'
      }`}
    >
      <Header />
      {!user && (
        <main className="px-6 py-10">
          Login or sign up to create documents.
        </main>
      )}
      {user && !selectedDocument && (
        <main className="px-6 py-10">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Select a document</h1>
            <button
              type="button"
              onClick={addDocument}
              className={`rounded px-4 py-2 text-sm font-medium ${
                isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-950 text-white'
              }`}
            >
              New document
            </button>
          </div>
          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
          <ul className="grid gap-2">
            {documents.map((document) => (
              <li key={document.id}>
                <button
                  type="button"
                  onClick={() => openDocument(document.id)}
                  className={`w-full rounded border px-4 py-3 text-left ${
                    isDark ? 'border-zinc-800 hover:bg-zinc-900' : 'border-zinc-200 hover:bg-white'
                  }`}
                >
                  <span className="block font-medium">{document.title}</span>
                  <span className="text-sm opacity-70">{document.id}</span>
                </button>
              </li>
            ))}
          </ul>
        </main>
      )}
      {user && selectedDocument && (
        <>
          <div className={`flex items-center justify-between border-b px-6 py-3 ${
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          }`}>
            {isRenaming ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onKeyDown={handleTitleKeyDown}
                className="rounded bg-transparent px-2 py-1 text-sm outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={startRename}
                className="text-sm opacity-70"
              >
                {selectedDocument.title}
              </button>
            )}
            <span className="text-sm opacity-70">{selectedDocument.id}</span>

            <button
              type="button"
              onClick={() => {
                setIsRenaming(false)
                setSelectedDocument(null)
              }}
            >
              Change document
            </button>
          </div>
          {error && <p className="px-6 py-2 text-sm text-red-500">{error}</p>}
          <Body document={selectedDocument}/>
        </>
      )}
    </div>
  )
}

export default App
