import { useState } from 'react'
import React, { useCallback, useEffect } from 'react'
import { HocuspocusProvider } from '@hocuspocus/provider'
import CharacterCount from '@tiptap/extension-character-count'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Highlight from '@tiptap/extension-highlight'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import StarterKit from '@tiptap/starter-kit'
import { lowlight } from 'lowlight'
import * as Y from 'yjs'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

import Dropcursor from '@tiptap/extension-dropcursor'
import Image from '@tiptap/extension-image'

import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

import { EditorContent, useEditor } from '@tiptap/react'
import './index.less'
import './components/tables/styles.less'
import { Menu, TableMenu } from './menus'
import DragHandle from './components/DragHandle'
lowlight.registerLanguage('html', html)
lowlight.registerLanguage('css', css)
lowlight.registerLanguage('js', js)
lowlight.registerLanguage('ts', ts)
const colors = [
  '#958DF1',
  '#F98181',
  '#FBBC88',
  '#FAF594',
  '#70CFF8',
  '#94FADB',
  '#B9F18D',
]
const names = [
  'Lea Thompson',
  'Cyndi Lauper',
  'Tom Cruise',
  'Madonna',
  'Jerry Hall',
  'Joan Collins',
  'Winona Ryder',
  'Christina Applegate',
  'Alyssa Milano',
  'Molly Ringwald',
  'Ally Sheedy',
  'Debbie Harry',
  'Olivia Newton-John',
  'Elton John',
  'Michael J. Fox',
  'Axl Rose',
  'Emilio Estevez',
  'Ralph Macchio',
  'Rob Lowe',
  'Jennifer Grey',
  'Mickey Rourke',
  'John Cusack',
  'Matthew Broderick',
  'Justine Bateman',
  'Lisa Bonet',
]

const getRandomElement = (list: string | any[]) =>
  list[Math.floor(Math.random() * list.length)]

const getRandomRoom = () => {
  const roomNumbers = [10, 11, 12]

  return getRandomElement(roomNumbers.map((number) => `rooms.${number}`))
}
const getRandomColor = () => getRandomElement(colors)
const getRandomName = () => getRandomElement(names)

const room = getRandomRoom()

const ydoc = new Y.Doc()
const websocketProvider = new HocuspocusProvider({
  url: 'ws://192.168.48.32:8088',
  parameters: {
    key: 'write_bqgvQ3Zwl34V4Nxt43zR',
  },
  name: room,
  document: ydoc,
})

const getInitialUser = () => {
  return (
    JSON.parse(localStorage.getItem('currentUser') as any) || {
      name: getRandomName(),
      color: getRandomColor(),
    }
  )
}

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      // extend the existing attributes …
      ...this.parent?.(),

      // and add a new one …
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-background-color'),
        renderHTML: (attributes) => {
          return {
            'data-background-color': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          }
        },
      },
    }
  },
})

const Editor = () => {
  const [status, setStatus] = useState('connecting')
  const [currentUser, setCurrentUser] = useState(getInitialUser)

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      // DraggableItem,
      Text,
      // ImageResize.configure({ resizeIcon: <>ResizeMe</> }),
      // CodeBlockLowlight.extend({
      //   addNodeView() {
      //     return ReactNodeViewRenderer(CodeBlockComponent)
      //   },
      // }).configure({ lowlight }),
      StarterKit.configure({
        history: false,
      }),
      Highlight,
      DragHandle,
      TaskList,
      TaskItem,
      Image,
      Dropcursor,
      CharacterCount.configure({
        limit: 10000,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: websocketProvider,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      // Default TableCell
      // TableCell,
      // Custom TableCell with backgroundColor attribute
      CustomTableCell,
    ],
    content: ` 
      <p>Followed by a fancy draggable item.</p>
    <p>This is a boring paragraph.</p>
      <p>Followed by a fancy draggable item.</p>
        <p>And a nested one.</p>
          <p>But can we go deeper?</p>
    <p>Let’s finish with a boring paragraph.</p> <img src="https://source.unsplash.com/8xznAGy4HcY/800x400" />
    <img src="https://source.unsplash.com/K9QHL52rE2k/800x400" /> <table>
    <tbody>
      <tr>
        <th>Name</th>
        <th colspan="3">Description</th>
      </tr>
      <tr>
        <td>Cyndi Lauper</td>
        <td>singer</td>
        <td>songwriter</td>
        <td>actress</td>
      </tr>
      <tr>
        <td>Marie Curie</td>
        <td>scientist</td>
        <td>chemist</td>
        <td>physicist</td>
      </tr>
      <tr>
        <td>Indira Gandhi</td>
        <td>prime minister</td>
        <td colspan="2">politician</td>
      </tr>
    </tbody>
  </table>
        <p>
          That’s a boring paragraph followed by a fenced code block:
        </p>
        <pre><code class="language-javascript">for (var i=1; i <= 20; i++)
{
  if (i % 15 == 0)
    console.log("FizzBuzz");
  else if (i % 3 == 0)
    console.log("Fizz");
  else if (i % 5 == 0)
    console.log("Buzz");
  else
    console.log(i);
}</code></pre>
        <p>
          Press Command/Ctrl + Enter to leave the fenced code block and continue typing in boring paragraphs.
        </p>
      `,
  })

  useEffect(() => {
    // Update status changes
    websocketProvider.on(
      'status',
      (event: { status: React.SetStateAction<string> }) => {
        setStatus(event.status)
      }
    )
  }, [])

  // Save current user to localStorage and emit to editor
  useEffect(() => {
    if (editor && currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
      editor.chain().focus().updateUser(currentUser).run()
    }
  }, [editor, currentUser])

  const setName = useCallback(() => {
    const name = (window.prompt('Name') || '').trim().substring(0, 32)

    if (name) {
      return setCurrentUser({ ...currentUser, name })
    }
  }, [currentUser])

  return (
    <div className="ttaio editor">
      {editor && <TableMenu editor={editor} />}

      <div style={{ padding: 100, position: 'relative' }}>
        <EditorContent className="editor__content" editor={editor} />
      </div>
      <div className="editor__footer">
        <div className={`editor__status editor__status--${status}`}>
          {status === 'connected'
            ? `${editor?.storage.collaborationCursor.users.length} user${
                editor?.storage.collaborationCursor.users.length === 1
                  ? ''
                  : 's'
              } online in ${room}`
            : 'offline'}
        </div>
        <div className="editor__name">
          <button onClick={setName}>{currentUser.name}</button>
        </div>
      </div>
      <div className="global-drag-handle">
        <div className="dropdown-menus">
          {editor && <Menu editor={editor} />}
        </div>
      </div>
    </div>
  )
}

export default Editor
