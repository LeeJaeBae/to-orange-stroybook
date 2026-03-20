import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as PMNode } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';

const pluginKey = new PluginKey('refineHighlight');

/**
 * 다듬기 대상 텍스트를 시각적으로 하이라이트하는 Tiptap 확장.
 * setRefineHighlight(editor, text) 로 활성화, setRefineHighlight(editor, null) 로 해제.
 */
export const RefineHighlightExtension = Extension.create({
  name: 'refineHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldDecos) {
            const meta = tr.getMeta(pluginKey);
            if (meta !== undefined) {
              if (meta === null) return DecorationSet.empty;
              return buildDecorations(tr.doc, meta.text);
            }
            return oldDecos.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return pluginKey.getState(state) ?? DecorationSet.empty;
          },
        },
      }),
    ];
  },
});

/** 문단의 텍스트를 추출 (hardBreak을 \n으로 변환 — editor.getText와 동일한 형식) */
function getNodeText(node: PMNode): string {
  let text = '';
  node.forEach((child) => {
    if (child.isText) {
      text += child.text || '';
    } else if (child.type.name === 'hardBreak') {
      text += '\n';
    }
  });
  return text;
}

/** 문서에서 textToHighlight에 해당하는 문단을 찾아 Decoration 생성 */
function buildDecorations(doc: PMNode, textToHighlight: string): DecorationSet {
  if (!textToHighlight?.trim()) return DecorationSet.empty;

  const paragraphs: Array<{ pmPos: number; nodeSize: number; text: string }> = [];
  const textParts: string[] = [];

  doc.forEach((child, offset) => {
    const text = getNodeText(child);
    paragraphs.push({ pmPos: offset + 1, nodeSize: child.nodeSize, text });
    textParts.push(text);
  });

  // editor.getText({ blockSeparator: '\n' }) 와 동일한 형식으로 전체 텍스트 구성
  const fullText = textParts.join('\n');
  const trimmed = textToHighlight.trim();
  const startOffset = fullText.lastIndexOf(trimmed);
  if (startOffset === -1) return DecorationSet.empty;

  const endOffset = startOffset + trimmed.length;
  let accumulated = 0;
  const matchedIndices: number[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const paraStart = accumulated;
    const paraEnd = accumulated + para.text.length;

    if (paraEnd > startOffset && paraStart < endOffset && para.text.trim()) {
      matchedIndices.push(i);
    }
    accumulated = paraEnd + 1; // +1 for '\n' block separator
  }

  if (matchedIndices.length === 0) return DecorationSet.empty;

  const decorations: Decoration[] = matchedIndices.map((idx, i) => {
    const para = paragraphs[idx];
    let posClass = 'refine-hl-only';
    if (matchedIndices.length > 1) {
      if (i === 0) posClass = 'refine-hl-first';
      else if (i === matchedIndices.length - 1) posClass = 'refine-hl-last';
      else posClass = 'refine-hl-mid';
    }
    return Decoration.node(para.pmPos, para.pmPos + para.nodeSize, {
      class: `refine-hl ${posClass}`,
    });
  });

  return DecorationSet.create(doc, decorations);
}

/** 다듬기 하이라이트 설정/해제 */
export function setRefineHighlight(editor: Editor, text: string | null) {
  if (!editor || editor.isDestroyed) return;
  const tr = editor.state.tr;
  tr.setMeta(pluginKey, text === null ? null : { text });
  editor.view.dispatch(tr);
}
