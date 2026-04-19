import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Pin } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  created_at: string
}

// Sample notes data for demonstration
const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to Notes',
    content: 'This is your first note. You can create, edit, and delete notes here.',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Project Ideas',
    content: 'Remember to work on the new dashboard design and user interface improvements.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Meeting Notes',
    content: 'Discussed quarterly goals and upcoming features for Q2.',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

export default function NotesPage() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Notes</h1>
            <p className="text-muted-foreground">Keep track of your thoughts and ideas</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleNotes.map((note) => (
            <Card key={note.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground line-clamp-2">
                  {note.title}
                </h2>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-secondary rounded">
                    <Pin className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="p-1 hover:bg-destructive/10 rounded">
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                {note.content}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sampleNotes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No notes yet</p>
            <Button>Create your first note</Button>
          </div>
        )}
      </div>
    </main>
  )
}
