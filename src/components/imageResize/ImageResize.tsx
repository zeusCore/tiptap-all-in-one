import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Editor } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import { ReactNode } from 'react'

interface SlashCommand {
  name: string
  description: string
  shortcut?: string
  handler: (editor: Editor) => void
}

interface SlashCommandProps {
  commands: SlashCommand[]
  renderCommand: (command: SlashCommand) => ReactNode
  renderDropdown?: (commands: SlashCommand[], activeIndex: number) => ReactNode
}

interface SlashCommandState {
  activeIndex: number
  isOpen: boolean
  commands: SlashCommand[]
}

const pluginKey = new PluginKey('slash_command')

export default Extension.create<SlashCommandProps>({
  name: 'slashCommand',

  defaultOptions: {
    renderCommand: (command) => command.name,
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pluginKey,

        state: {
          init(_, state: EditorState) {
            return SlashCommandPlugin.getState(state, [])
          },

          apply(tr, pluginState: SlashCommandState, _, state: EditorState) {
            const { selection } = state

            if (selection.empty) {
              return pluginState
            }

            const commandString = SlashCommandPlugin.getCommandString(state)

            if (commandString === '') {
              return pluginState
            }

            const commands = SlashCommandPlugin.getMatchingCommands(
              pluginState.commands,
              commandString
            )

            if (commands.length === 0) {
              return pluginState
            }

            const newState = {
              ...pluginState,
              commands,
              activeIndex: 0,
              isOpen: true,
            }

            return newState
          },
        },

        view: (view: EditorView) => {
          return {
            update: (view: EditorView, prevState: EditorState) => {
              const pluginState = pluginKey.getState(view.state)

              if (pluginState.isOpen) {
                SlashCommandPlugin.showDropdown(view, pluginState)
              }
            },
          }
        },
      }),
    ]
  },

  addCommands() {
    return {
      hideSlashCommandDropdown:
        () =>
        ({ tr, dispatch }) => {
          const newState = tr.setMeta(pluginKey, {
            ...pluginKey.getState(tr.state),
            isOpen: false,
          })

          if (dispatch) {
            dispatch(newState)
          }

          return true
        },
      selectPreviousSlashCommand:
        () =>
        ({ tr, dispatch }) => {
          const pluginState = pluginKey.getState(tr.state)
          const activeIndex =
            pluginState.activeIndex === 0
              ? pluginState.commands.length - 1
              : pluginState.activeIndex - 1

          const newState = tr.setMeta(pluginKey, {
            ...pluginState,
            activeIndex,
          })

          if (dispatch) {
            dispatch(newState)
          }

          return true
        },
      selectNextSlashCommand:
        () =>
        ({ tr, dispatch }) => {
          const pluginState = pluginKey.getState(tr.state)
          const activeIndex =
            (pluginState.activeIndex + 1) % pluginState.commands.length

          const newState = tr.setMeta(pluginKey, {
            ...pluginState,
            activeIndex,
          })

          if (dispatch) {
            dispatch(newState)
          }

          return true
        },
      executeActiveSlashCommand:
        () =>
        ({ tr, dispatch, state }) => {
          const pluginState = pluginKey.getState(state)

          if (pluginState.commands.length === 0) {
            return false
          }

          const command = pluginState.commands[pluginState.activeIndex]

          command.handler(state.tiptapEditor as Editor)

          const newState = tr.setMeta(pluginKey, {
            ...pluginState,
            isOpen: false,
          })

          if (dispatch) {
            dispatch(newState)
          }

          return true
        },
    }
  },

  onEditor(view) {
    view.dom.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === '/') {
        view.dispatch(
          view.state.tr.setMeta(pluginKey, {
            ...pluginKey.getState(view.state),
            isOpen: true,
          })
        )

        event.preventDefault()
      } else if (event.key === 'Escape') {
        view.dispatch(
          view.state.tr.setMeta(pluginKey, {
            ...pluginKey.getState(view.state),
            isOpen: false,
          })
        )

        event.preventDefault()
      } else if (event.key === 'ArrowUp') {
        view.dispatch(
          view.state.tr.setMeta(pluginKey, {
            ...pluginKey.getState(view.state),
            isOpen: true,
          })
        )
        view.execCommand('selectPreviousSlashCommand')

        event.preventDefault()
      } else if (event.key === 'ArrowDown') {
        view.dispatch(
          view.state.tr.setMeta(pluginKey, {
            ...pluginKey.getState(view.state),
            isOpen: true,
          })
        )
        view.execCommand('selectNextSlashCommand')

        event.preventDefault()
      } else if (event.key === 'Enter') {
        view.dispatch(
          view.state.tr.setMeta(pluginKey, {
            ...pluginKey.getState(view.state),
            isOpen: false,
          })
        )
        view.execCommand('executeActiveSlashCommand')

        event.preventDefault()
      }
    })
  },

  addGlobalAttributes() {
    return [
      {
        types: ['text'],
        attributes: {
          'data-slash-command-active-index': {
            default: -1,
          },
        },
      },
    ]
  },

  addProps() {
    return {
      editorProps: {
        attributes: {
          'data-slash-command-active-index': (state) =>
            pluginKey.getState(state).activeIndex,
        },
      },
    }
  },

  EditorView: {
    props: {
      handleClick: (
        view: EditorView,
        pos: number,
        event: MouseEvent,
        direct: boolean
      ) => {
        const pluginState = pluginKey.getState(view.state)

        if (
          pluginState.isOpen &&
          !event.target.closest('[data-slash-command-dropdown]')
        ) {
          view.dispatch(
            view.state.tr.setMeta(pluginKey, { ...pluginState, isOpen: false })
          )
        }

        return false
      },
    },
  },

  staticFields: {
    getCommandString: SlashCommandPlugin.getCommandString,
    getMatchingCommands: SlashCommandPlugin.getMatchingCommands,
    getState: SlashCommandPlugin.getState,
    showDropdown: SlashCommandPlugin.showDropdown,
  },
})
