import dayjs from 'dayjs'
import Link from 'next/link'
import { FC, useRef } from 'react'
import { NoteCacheItem } from 'libs/web/cache'
import MarkText from 'components/portal/filter-modal/mark-text'
import PortalState from 'libs/web/state/portal'
import classNames from 'classnames'
import useScrollView from 'libs/web/hooks/use-scroll-view'

const SearchItem: FC<{
  note: NoteCacheItem
  keyword?: string
  selected?: boolean
}> = ({ note, keyword, selected }) => {
  const {
    search: { close },
  } = PortalState.useContainer()
  const ref = useRef<HTMLLIElement>(null)

  useScrollView(ref, selected)

  return (
    <li
      ref={ref}
      className={classNames('hover:bg-gray-200 cursor-pointer', {
        'bg-gray-300': selected,
      })}
    >
      <Link href={`/${note.id}`} shallow>
        <a className="py-2 px-4 block text-xs text-gray-500" onClick={close}>
          <h4 className="text-sm font-bold">
            <MarkText text={note.title} keyword={keyword} />
          </h4>
          <p className="mt-1">
            <MarkText text={note.rawContent} keyword={keyword} />
          </p>
          <time className="text-gray-300 mt-2 block" dateTime={note.date}>
            {dayjs(note.date).format('DD/MM/YYYY HH:mm')}
          </time>
        </a>
      </Link>
    </li>
  )
}

export default SearchItem
