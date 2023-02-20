import './styles.scss'

import { HocuspocusProvider } from '@hocuspocus/provider'
import CharacterCount from '@tiptap/extension-character-count'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Highlight from '@tiptap/extension-highlight'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import StarterKit from '@tiptap/starter-kit'
import React, { useCallback, useEffect, useState } from 'react'
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

import {
  EditorContent,
  ReactNodeViewRenderer,
  useEditor,
  FloatingMenu,
  BubbleMenu,
} from '@tiptap/react'
import CodeBlockComponent from './components/codeBlock/CodeBlockComponent'

import DraggableItem from './components/DraggableItem.jsx'

import ImageResize from './components/tiptap-imagresize/src'
import DragHandle from './components/DragHandle.js'

import { variables } from '../../../variables'
import MenuBar from './MenuBar'
import './components/codeBlock/styles.scss'
import './components/tables/styles.scss'
import { useMemo } from 'react'

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
export const tableHTML = `
  <table style="width:100%">
    <tr>
      <th>Firstname</th>
      <th>Lastname</th>
      <th>Age</th>
    </tr>
    <tr>
      <td>Jill</td>
      <td>Smith</td>
      <td>50</td>
    </tr>
    <tr>
      <td>Eve</td>
      <td>Jackson</td>
      <td>94</td>
    </tr>
    <tr>
      <td>John</td>
      <td>Doe</td>
      <td>80</td>
    </tr>
  </table>
`
const getRandomElement = (list) => list[Math.floor(Math.random() * list.length)]

const getRandomRoom = () => {
  const roomNumbers = variables.collabRooms?.trim()?.split(',') ?? [10, 11, 12]

  return getRandomElement(roomNumbers.map((number) => `rooms.${number}`))
}
const getRandomColor = () => getRandomElement(colors)
const getRandomName = () => getRandomElement(names)

const room = getRandomRoom()

const ydoc = new Y.Doc()
const websocketProvider = new HocuspocusProvider({
  url: 'ws://192.168.48.32:808',
  parameters: {
    key: 'write_bqgvQ3Zwl34V4Nxt43zR',
  },
  name: room,
  document: ydoc,
})

const getInitialUser = () => {
  return (
    JSON.parse(localStorage.getItem('currentUser')) || {
      name: getRandomName(),
      color: getRandomColor(),
    }
  )
}
const MenuBar2 = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <>
      {/* {editor && (
        <BubbleMenu className="bubble-menu" tippyOptions={{ duration: 100 }} editor={editor}>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "is-active" : ""}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "is-active" : ""}
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "is-active" : ""}
          >
            Strike
          </button>
        </BubbleMenu>
      )} */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}>
        bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}>
        italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}>
        strike
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? 'is-active' : ''}>
        code
      </button>
      <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>
        clear marks
      </button>
      <button onClick={() => editor.chain().focus().clearNodes().run()}>
        clear nodes
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive('paragraph') ? 'is-active' : ''}>
        paragraph
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>
        h1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>
        h2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}>
        h3
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}>
        h4
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}>
        h5
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}>
        h6
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}>
        bullet list
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}>
        ordered list
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'is-active' : ''}>
        code block
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}>
        blockquote
      </button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        horizontal rule
      </button>
      <button onClick={() => editor.chain().focus().setHardBreak().run()}>
        hard break
      </button>
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }>
        insertTable
      </button>
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertContent(tableHTML, {
              parseOptions: {
                preserveWhitespace: false,
              },
            })
            .run()
        }>
        insertHTMLTable
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        disabled={!editor.can().addColumnBefore()}>
        addColumnBefore
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        disabled={!editor.can().addColumnAfter()}>
        addColumnAfter
      </button>
      <button
        onClick={() => editor.chain().focus().deleteColumn().run()}
        disabled={!editor.can().deleteColumn()}>
        deleteColumn
      </button>
      <button
        onClick={() => editor.chain().focus().addRowBefore().run()}
        disabled={!editor.can().addRowBefore()}>
        addRowBefore
      </button>
      <button
        onClick={() => editor.chain().focus().addRowAfter().run()}
        disabled={!editor.can().addRowAfter()}>
        addRowAfter
      </button>
      <button
        onClick={() => editor.chain().focus().deleteRow().run()}
        disabled={!editor.can().deleteRow()}>
        deleteRow
      </button>
      <button
        onClick={() => editor.chain().focus().deleteTable().run()}
        disabled={!editor.can().deleteTable()}>
        deleteTable
      </button>
      <button
        onClick={() => editor.chain().focus().mergeCells().run()}
        disabled={!editor.can().mergeCells()}>
        mergeCells
      </button>
      <button
        onClick={() => editor.chain().focus().splitCell().run()}
        disabled={!editor.can().splitCell()}>
        splitCell
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
        disabled={!editor.can().toggleHeaderColumn()}>
        toggleHeaderColumn
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
        disabled={!editor.can().toggleHeaderRow()}>
        toggleHeaderRow
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeaderCell().run()}
        disabled={!editor.can().toggleHeaderCell()}>
        toggleHeaderCell
      </button>
      <button
        onClick={() => editor.chain().focus().mergeOrSplit().run()}
        disabled={!editor.can().mergeOrSplit()}>
        mergeOrSplit
      </button>
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .setCellAttribute('backgroundColor', '#FAF594')
            .run()
        }
        disabled={!editor.can().setCellAttribute('backgroundColor', '#FAF594')}>
        setCellAttribute
      </button>
      <button
        onClick={() => editor.chain().focus().fixTables().run()}
        disabled={!editor.can().fixTables()}>
        fixTables
      </button>
      <button
        onClick={() => editor.chain().focus().goToNextCell().run()}
        disabled={!editor.can().goToNextCell()}>
        goToNextCell
      </button>
      <button
        onClick={() => editor.chain().focus().goToPreviousCell().run()}
        disabled={!editor.can().goToPreviousCell()}>
        goToPreviousCell
      </button>
      <button onClick={() => editor.chain().focus().undo().run()}>undo</button>
      <button onClick={() => editor.chain().focus().redo().run()}>redo</button>
    </>
  )
}
export default () => {
  const [status, setStatus] = useState('connecting')
  const [currentUser, setCurrentUser] = useState(getInitialUser)

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      // DraggableItem,
      Text,
      // ImageResize.configure({ resizeIcon: <>ResizeMe</> }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent)
        },
      }).configure({ lowlight }),
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
    websocketProvider.on('status', (event) => {
      setStatus(event.status)
    })
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
    <div className="editor">
      {editor && <MenuBar editor={editor} />}
      <EditorContent className="editor__content" editor={editor} />
      <div className="editor__footer">
        <MenuBar2 editor={editor} />
        <div className={`editor__status editor__status--${status}`}>
          {status === 'connected'
            ? `${editor.storage.collaborationCursor.users.length} user${
                editor.storage.collaborationCursor.users.length === 1 ? '' : 's'
              } online in ${room}`
            : 'offline'}
        </div>
        <div className="editor__name">
          <button onClick={setName}>{currentUser.name}</button>
        </div>
      </div>
    </div>
  )
}
