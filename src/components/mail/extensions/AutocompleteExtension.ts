import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface AutocompleteOptions {
  suggestion: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export interface AutocompleteStorage {
  suggestion: string;
}

// editor.storage 접근을 위한 헬퍼 타입
interface EditorStorageWithAutocomplete {
  autocomplete: AutocompleteStorage;
}

export const autocompletePluginKey = new PluginKey('autocomplete');

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    autocomplete: {
      setSuggestion: (suggestion: string) => ReturnType;
      clearSuggestion: () => ReturnType;
      acceptSuggestion: () => ReturnType;
    };
  }
}

export const AutocompleteExtension = Extension.create<AutocompleteOptions, AutocompleteStorage>({
  name: 'autocomplete',

  addOptions() {
    return {
      suggestion: '',
      onAccept: () => {},
      onDismiss: () => {},
    };
  },

  addStorage() {
    return {
      suggestion: '',
    };
  },

  addCommands() {
    return {
      setSuggestion:
        (suggestion: string) =>
        ({ editor }) => {
          const storage = (editor.storage as unknown as EditorStorageWithAutocomplete).autocomplete;
          storage.suggestion = suggestion;
          // 뷰 업데이트 트리거
          const { tr } = editor.state;
          editor.view.dispatch(tr.setMeta(autocompletePluginKey, { suggestion }));
          return true;
        },
      clearSuggestion:
        () =>
        ({ editor }) => {
          const storage = (editor.storage as unknown as EditorStorageWithAutocomplete).autocomplete;
          storage.suggestion = '';
          const { tr } = editor.state;
          editor.view.dispatch(tr.setMeta(autocompletePluginKey, { suggestion: '' }));
          this.options.onDismiss();
          return true;
        },
      acceptSuggestion:
        () =>
        ({ editor, chain }) => {
          const storage = (editor.storage as unknown as EditorStorageWithAutocomplete).autocomplete;
          const suggestion = storage.suggestion;
          if (!suggestion) return false;

          // 제안 텍스트 삽입
          chain().insertContent(suggestion).run();

          // 제안 초기화
          storage.suggestion = '';
          const { tr } = editor.state;
          editor.view.dispatch(tr.setMeta(autocompletePluginKey, { suggestion: '' }));
          this.options.onAccept();
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        const storage = (editor.storage as Partial<EditorStorageWithAutocomplete>).autocomplete;
        if (storage?.suggestion) {
          editor.commands.acceptSuggestion();
          return true;
        }
        return false;
      },
      Escape: ({ editor }) => {
        const storage = (editor.storage as Partial<EditorStorageWithAutocomplete>).autocomplete;
        if (storage?.suggestion) {
          editor.commands.clearSuggestion();
          return true;
        }
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: autocompletePluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldState, _oldEditorState, newEditorState) {
            const meta = tr.getMeta(autocompletePluginKey);
            if (meta !== undefined) {
              const { suggestion } = meta;
              if (!suggestion) {
                return DecorationSet.empty;
              }

              // 현재 커서 위치에 ghost text decoration 추가
              const { selection } = newEditorState;
              const pos = selection.$head.pos;

              const widget = Decoration.widget(pos, () => {
                const span = document.createElement('span');
                span.className = 'autocomplete-suggestion';
                span.textContent = suggestion;
                return span;
              });

              return DecorationSet.create(newEditorState.doc, [widget]);
            }

            // 문서가 변경되면 제안 제거
            if (tr.docChanged) {
              extension.storage.suggestion = '';
              return DecorationSet.empty;
            }

            return oldState;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
