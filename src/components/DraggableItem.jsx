import { mergeAttributes, Node } from "@tiptap/core";
import { useMemo } from "react";
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'


const com = () => {
  return (
    <NodeViewWrapper class="draggable-item">
      <div class="drag-handle" contenteditable="false" draggable="true" data-drag-handle />
      <NodeViewContent class="content" />
    </NodeViewWrapper>
  );
};

export default Node.create({
  name: "draggableItem",

  group: "block",

  content: "block+",

  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="draggable-item"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "draggable-item" }), 0];
  },

  addNodeView() {
    return com;
  },
});
