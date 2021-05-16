import NoteTreeState from 'libs/web/state/tree'
import { FC, useEffect } from 'react'
import NoteState from 'libs/web/state/note'
import { useResizeDetector } from 'react-resize-detector'
import Sidebar from 'components/sidebar/sidebar'
import UIState from 'libs/web/state/ui'
import Resizable from 'components/resizable'
import { TreeModel } from 'libs/shared/tree'
import TrashState from 'libs/web/state/trash'
import TrashModal from 'components/portal/trash-modal/trash-modal'
import SearchState from 'libs/web/state/search'
import SearchModal from 'components/portal/search-modal/search-modal'
import ShareModal from 'components/portal/share-modal'
import { SwipeableDrawer } from '@material-ui/core'
import SidebarMenu from 'components/portal/sidebar-menu'
import { NoteModel } from 'libs/shared/note'

const MainWrapper: FC = ({ children }) => {
  const {
    sidebar: { visible },
  } = UIState.useContainer()
  const { ref, width = 0 } = useResizeDetector<HTMLDivElement>({
    handleHeight: false,
  })

  return (
    <div className="h-full" ref={ref}>
      <Resizable width={width}>
        <Sidebar />
        <main className="relative flex-grow">{children}</main>
      </Resizable>
      <style jsx global>
        {`
          .gutter {
            pointer-events: ${visible ? 'none' : 'auto'};
          }
        `}
      </style>
    </div>
  )
}

const MobileMainWrapper: FC = ({ children }) => {
  const {
    sidebar: { visible, open, close },
  } = UIState.useContainer()

  return (
    <div className="flex h-full">
      <SwipeableDrawer
        anchor="left"
        open={visible}
        onClose={close}
        onOpen={open}
        hysteresis={0.4}
        // todo 优化移动端左边按钮和滑动冲突的问题
        disableDiscovery
      >
        <Sidebar />
      </SwipeableDrawer>

      <main className="flex-grow overflow-y-auto" onClick={close}>
        {children}
      </main>
      <style jsx global>
        {`
          .gutter {
            pointer-events: none;
          }
        `}
      </style>
    </div>
  )
}

const LayoutMain: FC<{
  tree?: TreeModel
  note?: NoteModel
}> = ({ children, tree, note }) => {
  const { ua } = UIState.useContainer()

  useEffect(() => {
    document.body.classList.add('overflow-hidden')
  }, [])

  return (
    <NoteTreeState.Provider initialState={tree}>
      <NoteState.Provider initialState={note}>
        {/* main layout */}
        {ua?.isMobileOnly ? (
          <MobileMainWrapper>{children}</MobileMainWrapper>
        ) : (
          <MainWrapper>{children}</MainWrapper>
        )}

        {/* modals */}
        <TrashState.Provider>
          <TrashModal />
        </TrashState.Provider>
        <SearchState.Provider>
          <SearchModal />
        </SearchState.Provider>
        <ShareModal />
        <SidebarMenu />
      </NoteState.Provider>
    </NoteTreeState.Provider>
  )
}

export default LayoutMain
