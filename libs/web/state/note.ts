import { useCallback, useState } from 'react'
import { createContainer } from 'unstated-next'
import NoteTreeState from 'libs/web/state/tree'
import { NOTE_DELETED, NOTE_SHARED } from 'libs/shared/meta'
import useNoteAPI from '../api/note'
import noteCache from '../cache/note'
import { NoteModel } from 'libs/shared/note'
import { useToast } from '../hooks/use-toast'

const useNote = (initData?: NoteModel) => {
  const [note, setNote] = useState<NoteModel | undefined>(initData)
  const { find } = useNoteAPI()
  const { create, error: createError } = useNoteAPI()
  const { mutate, loading, abort } = useNoteAPI()
  const {
    addItem,
    removeItem,
    mutateItem,
    genNewId,
  } = NoteTreeState.useContainer()
  const toast = useToast()

  const fetchNote = useCallback(
    async (id: string) => {
      const cache = await noteCache.getItem(id)
      if (cache) {
        setNote(cache)
      }
      const result = await find(id)

      if (!result) {
        throw new Error(`not found note:${id}`)
      }

      result.content = result.content || '\n'
      setNote(result)
      await noteCache.setItem(id, result)
    },
    [find]
  )

  const removeNote = useCallback(
    async (id: string) => {
      await mutate(id, { deleted: NOTE_DELETED.DELETED })
      await noteCache.mutateItem(id, { deleted: NOTE_DELETED.DELETED })
      await removeItem(id)
    },
    [mutate, removeItem]
  )

  const createNote = useCallback(
    async (body: Partial<NoteModel>) => {
      const result = await create(body)

      if (!result) {
        toast(createError, 'error')
        return
      }

      result.content = result.content || '\n'
      await noteCache.setItem(result.id, result)
      setNote(result)
      addItem(result)

      return result
    },
    [create, addItem, toast, createError]
  )

  const createNoteWithTitle = useCallback(
    async (title: NoteModel['title']) => {
      const id = genNewId()
      const result = await create({
        id,
        title,
      })

      if (!result) {
        return
      }

      result.content = result.content || '\n'
      await noteCache.setItem(result.id, result)
      addItem(result)

      return { id }
    },
    [addItem, create, genNewId]
  )

  const updateNote = useCallback(
    async (data: Partial<NoteModel>) => {
      abort()

      if (!note?.id) {
        toast('Not found id', 'error')
        return
      }
      const newNote = {
        ...note,
        ...data,
      }
      delete newNote.content
      setNote(newNote)
      mutateItem(newNote.id, {
        data: newNote,
      })
      await mutate(note.id, data)
      await noteCache.mutateItem(note.id, data)
    },
    [abort, toast, note, mutate, mutateItem]
  )

  const initNote = useCallback((note: Partial<NoteModel>) => {
    setNote({
      deleted: NOTE_DELETED.NORMAL,
      shared: NOTE_SHARED.PRIVATE,
      id: '-1',
      title: '',
      ...note,
    })
  }, [])

  const findOrCreateNote = useCallback(
    async (id: string, note: Partial<NoteModel>) => {
      try {
        await fetchNote(id)
      } catch (e) {
        await createNote({
          id,
          ...note,
        })
      }
    },
    [createNote, fetchNote]
  )

  return {
    note,
    fetchNote,
    createNote,
    findOrCreateNote,
    createNoteWithTitle,
    updateNote,
    removeNote,
    initNote,
    loading,
  }
}

const NoteState = createContainer(useNote)

export default NoteState
