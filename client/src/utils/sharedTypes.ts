export type FilterForm = {
  participants: string[]
  status: ('unassigned' | 'assigned' | 'done')[]
  range: { from: string | null; to: string | null }
}
