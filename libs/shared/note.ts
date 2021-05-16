import { NOTE_DELETED, NOTE_SHARED } from './meta'

export interface NoteModel {
  id: string
  title: string
  pid?: string
  content?: string
  pic?: string
  date?: string
  deleted: NOTE_DELETED
  shared: NOTE_SHARED
}

/**
 * like `/IHqMRohfi2`
 */
export const isNoteLink = (str: string) => {
  return new RegExp(`^/${NOTE_ID_REGEXP}$`).test(str)
}

export const NOTE_ID_REGEXP = '[A-Za-z0-9_-]+'
