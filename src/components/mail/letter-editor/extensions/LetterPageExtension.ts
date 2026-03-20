import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { getDocText, getDocTextOffsetAtPos, getDocTextSlice } from '../utils';

export interface LetterPageOptions {
  maxLines: number;
  lineHeight: number;
  onEnterAtLastLine: () => void;
  onBackspaceAtStart: () => void;
  onLineOverflow: (text: string) => void;
  onPaste: (payload: { fullText: string; selectionStart: number; selectionEnd: number; pastedText: string }) => void;
  onSelectAll: () => void;
}

const letterPagePluginKey = new PluginKey('letterPage');

function getRenderedLineCount(height: number, lineHeight: number): number {
  const ratio = height / lineHeight;
  return Math.max(1, Math.ceil(ratio - 0.05));
}

/**
 * 에디터 DOM의 시각적 줄 수를 각 단락(p) 별로 개별 측정합니다.
 * 전체 높이를 한 번에 나누면 반올림 오차가 누적되어
 * 18줄인데 17줄로 측정되는 경우가 있으므로,
 * 각 단락을 개별 측정하여 합산합니다.
 */
function countVisualLines(editorDom: HTMLElement, lineHeight: number): number {
  const children = editorDom.children;
  if (children.length === 0) return 0;

  let total = 0;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement;
    total += getRenderedLineCount(child.getBoundingClientRect().height, lineHeight);
  }
  return total;
}

/**
 * hidden div로 텍스트의 시각적 줄 수를 사전 측정합니다.
 * countVisualLines와 동일하게 <p> 단위로 개별 측정합니다.
 * (전체 높이를 한 번에 나누면 반올림 오차로 줄 수가 적게 측정됨)
 */
function measureTextVisualLines(
  text: string,
  editorDom: HTMLElement,
  lineHeight: number
): number {
  const div = document.createElement('div');
  const cs = window.getComputedStyle(editorDom);
  div.style.cssText = `
    position:absolute;visibility:hidden;
    width:${cs.width};
    padding-left:${cs.paddingLeft};
    padding-right:${cs.paddingRight};
    font-family:${cs.fontFamily};
    font-size:${cs.fontSize};
    line-height:${lineHeight}px;
    white-space:pre-wrap;word-break:break-word;overflow-wrap:break-word;
    box-sizing:border-box;
  `;

  // 에디터와 동일하게 <p> 단위로 렌더링
  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    const p = document.createElement('p');
    p.style.cssText = `margin:0;padding:0;line-height:${lineHeight}px;`;
    p.textContent = para || '\u200B';
    div.appendChild(p);
  }

  document.body.appendChild(div);

  let total = 0;
  for (let i = 0; i < div.children.length; i++) {
    const child = div.children[i] as HTMLElement;
    total += getRenderedLineCount(child.getBoundingClientRect().height, lineHeight);
  }

  document.body.removeChild(div);
  return Math.max(total, 1);
}

export const LetterPageExtension = Extension.create<LetterPageOptions>({
  name: 'letterPage',

  addOptions() {
    return {
      maxLines: 18,
      lineHeight: 43,
      onEnterAtLastLine: () => {},
      onBackspaceAtStart: () => {},
      onLineOverflow: () => {},
      onPaste: () => {},
      onSelectAll: () => {},
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const lines = countVisualLines(editor.view.dom, this.options.lineHeight);
        if (lines >= this.options.maxLines - 1) {
          const { $head } = editor.state.selection;
          const textAfter = getDocText(editor.state.doc).slice(
            getDocTextOffsetAtPos(editor.state.doc, $head.pos)
          );
          if (textAfter.trim().length > 0) {
            // 커서 뒤에 텍스트가 있고 이미 maxLines 이상이면 Enter 허용 → 오버플로우 핸들러가 분할
            if (lines >= this.options.maxLines) return false;
            // maxLines-1이고 뒤에 텍스트가 있으면 일반 Enter 처리
            return false;
          }
          // 커서가 문서 끝이고 페이지가 거의 가득 참 → 새 페이지로 이동
          // (maxLines-1일 때도 Enter가 빈줄만 추가하고 바로 또 Enter가 필요한 중간 단계 생략)
          this.options.onEnterAtLastLine();
          return true;
        }
        return false;
      },
      'Mod-a': ({ editor }) => {
        editor.commands.selectAll();
        this.options.onSelectAll();
        return true;
      },
      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        const { $head } = selection;
        const isAtStart = $head.pos <= 1 && selection.empty;
        const isDocEmpty = !editor.state.doc.textContent.trim();
        if (isAtStart || isDocEmpty) {
          this.options.onBackspaceAtStart();
          return true;
        }
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    let isComposing = false;
    // 무한 루프 방지: 동일 텍스트에 대해 오버플로우 콜백을 한 번만 호출
    let lastOverflowText = '';

    return [
      new Plugin({
        key: letterPagePluginKey,
        // view().update()로 문서 변경 후 시각적 줄 수 체크
        view() {
          return {
            update(view, prevState) {
              if (isComposing) return;
              if (view.state.doc.eq(prevState.doc)) return;

              const lines = countVisualLines(view.dom, extension.options.lineHeight);
              if (lines > extension.options.maxLines) {
                const text = getDocText(view.state.doc);
                if (text !== lastOverflowText) {
                  lastOverflowText = text;
                  setTimeout(() => {
                    extension.options.onLineOverflow(text);
                  }, 0);
                }
              } else {
                lastOverflowText = '';
              }
            },
          };
        },
        props: {
          handleDOMEvents: {
            compositionstart() {
              isComposing = true;
              return false;
            },
            compositionend(view) {
              isComposing = false;
              setTimeout(() => {
                const lines = countVisualLines(view.dom, extension.options.lineHeight);
                if (lines > extension.options.maxLines) {
                  const text = getDocText(view.state.doc);
                  if (text !== lastOverflowText) {
                    lastOverflowText = text;
                    extension.options.onLineOverflow(text);
                  }
                }
              }, 0);
              return false;
            },
          },
          handlePaste(view, event) {
            let pastedText = event.clipboardData?.getData('text/plain');
            if (!pastedText) return false;

            // Windows 줄바꿈(\r\n) 정규화
            pastedText = pastedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

            const { from, to } = view.state.selection;
            const doc = view.state.doc;
            const textBefore = from > 0 ? getDocTextSlice(doc, 0, from) : '';
            const textAfter = to < doc.content.size ? getDocTextSlice(doc, to, doc.content.size) : '';
            const combinedText = textBefore + pastedText + textAfter;

            // 시각적 줄 수 측정 (워드랩 반영)
            const resultLines = measureTextVisualLines(
              combinedText,
              view.dom,
              extension.options.lineHeight
            );

            if (resultLines > extension.options.maxLines) {
              event.preventDefault();
              extension.options.onPaste({
                fullText: combinedText,
                selectionStart: textBefore.length,
                selectionEnd: textBefore.length + pastedText.length,
                pastedText,
              });
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});
