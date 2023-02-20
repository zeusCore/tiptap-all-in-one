import { Component, FC, ReactElement } from "react";
import { mergeAttributes, nodeInputRule, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageResizeComponent from "./component/ImageResizeComponent";
import Image from "@tiptap/extension-image";

export const inputRegex = /(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;
export const ImageResize = Image.extend({
  name: "imageResize",
  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      resizeIcon: <span>⊙</span>,
      useFigure: false,
    };
  },
  addAttributes() {
    return {
      width: {
        default: "100%",
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: "auto",
        renderHTML: (attributes) => {
          return {
            height: attributes.height,
          };
        },
      },
      isDraggable: {
        default: true,
        renderHTML: (attributes) => {
          return {};
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "image-resizer",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["image-resizer", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeComponent);
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, , alt, src, title, height, width, isDraggable] = match;
          return { src, alt, title, height, width, isDraggable };
        },
      }),
    ];
  },
});
