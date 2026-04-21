import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { cn } from '@lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { TEXT_EDITOR_COLOR } from '@constants/index';
import TooltipUi from '@components/tooltip';
import { useT } from '@hooks/useT';
import { uniqueId } from 'lodash';
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';

export interface TiptapEditorRef {
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleTextAlignLeft: () => void;
  toggleTextAlignCenter: () => void;
  toggleTextAlignRight: () => void;
  toggleColor: (color: string) => void;
  getHTML: () => string;
  focus: () => void;
}

interface Props {
  className?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  value?: string;
  color?: string;
  onFocus?: React.FocusEventHandler<HTMLDivElement> | undefined;
  onBlur?: React.FocusEventHandler<HTMLDivElement> | undefined;
  key?: number;
}

const TiptapEditor = forwardRef<TiptapEditorRef, Props>(
  ({ className, placeholder, onChange, value, color, onFocus, onBlur, key }, ref) => {
    const { t } = useT();
    const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        TextAlign.configure({
          defaultAlignment: !value ? 'center' : 'center',
          types: ['heading', 'paragraph']
        }),
        Placeholder.configure({
          placeholder: placeholder
        }),
        TextStyle,
        Color.configure({
          types: ['textStyle'] // áp dụng cho node textStyle
        })
      ],
      content: value,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onChange?.(html);
      },
      onCreate({ editor }) {
        if (color) {
          editor.chain().setColor(color).run();
        }
      },
      editorProps: {
        attributes: {
          style: `color: ${color || '#333333'}` // Màu mặc định
        }
      }
    });

    useImperativeHandle(
      ref,
      () => ({
        toggleBold: () => editor?.chain().focus().toggleBold().run(),
        toggleItalic: () => editor?.chain().focus().toggleItalic().run(),
        toggleUnderline: () => editor?.chain().focus().toggleUnderline().run(),
        toggleTextAlignLeft: () => editor?.chain().focus().toggleTextAlign('left').run(),
        toggleTextAlignCenter: () => editor?.chain().focus().toggleTextAlign('center').run(),
        toggleTextAlignRight: () => editor?.chain().focus().toggleTextAlign('right').run(),
        getHTML: () => editor?.getHTML() ?? '',
        focus: () => editor?.commands.focus(),
        toggleColor: (color: string) =>
          editor
            ?.chain()
            .focus()
            .setColor(color || '#ffffff')
            .run()
      }),
      [editor]
    );

    return (
      <>
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className='bg-white border border-gray-300 rounded-lg p-1.5 flex gap-2' id='bubble-editor-menu'>
              <Popover>
                <PopoverTrigger
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <TooltipUi description={t('change_text_color')}>
                    <button
                      className={`text-sm font-medium border-b-[3px] hover:bg-gray-200 hover:rounded-t-md size-8`}
                      style={{
                        borderColor: editor.getAttributes('textStyle').color
                      }}
                    >
                      A
                    </button>
                  </TooltipUi>
                </PopoverTrigger>
                <PopoverContent align='start' className='p-2 w-fit max-w-[250px]'>
                  <div className='flex items-start gap-2 flex-wrap'>
                    {TEXT_EDITOR_COLOR.map((color) => (
                      <div
                        key={color.color}
                        className='size-10 rounded-sm shadow-lg cursor-pointer '
                        onClick={() => editor.chain().focus().setColor(color.color).run()}
                        style={{
                          backgroundColor: color.color,
                          border: `2.5px solid ${editor.getAttributes('textStyle').color === color.color ? color.border : 'transparent'}`
                        }}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <TooltipUi description={t('bold') + ' (ctrl + B)'}>
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`bg-transparent ${editor.isActive('bold') ? 'bg-purple-500 hover:bg-purple-600 hover:text-primary-neutral-50' : 'hover:bg-gray-200 bg-transparent text-primary-neutral-900'} rounded-md text-sm font-bold size-8`}
                >
                  B
                </button>
              </TooltipUi>
              <TooltipUi description={t('italic') + ' (ctrl + I)'}>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`bg-transparent ${editor.isActive('italic') ? 'bg-purple-500 hover:bg-purple-600 hover:text-primary-neutral-50' : 'hover:bg-gray-200 bg-transparent text-primary-neutral-900'} rounded-md text-sm font-medium italic size-8`}
                >
                  I
                </button>
              </TooltipUi>
              <TooltipUi description={t('underline') + ' (ctrl + U)'}>
                <button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`bg-transparent ${editor.isActive('underline') ? 'bg-purple-500 hover:bg-purple-600 hover:text-primary-neutral-50' : 'hover:bg-gray-200 bg-transparent text-primary-neutral-900'} rounded-md text-sm font-medium underline size-8`}
                >
                  U
                </button>
              </TooltipUi>
              <TooltipUi description={t('align_left')}>
                <button
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  className={`bg-transparent ${editor.isActive({ textAlign: 'left' }) ? 'bg-purple-500 hover:bg-purple-600 hover:text-primary-neutral-50' : 'hover:bg-gray-200 bg-transparent text-primary-neutral-900'} rounded-md text-sm font-medium underline size-8 flex items-center justify-center`}
                >
                  <AlignLeft className='size-4' />
                </button>
              </TooltipUi>
              <TooltipUi description={t('align_center')}>
                <button
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  className={`bg-transparent ${editor.isActive({ textAlign: 'center' }) ? 'bg-purple-500 hover:bg-purple-600 hover:text-primary-neutral-50' : 'hover:bg-gray-200 bg-transparent text-primary-neutral-900'} rounded-md text-sm font-medium underline size-8 flex items-center justify-center`}
                >
                  <AlignCenter className='size-4' />
                </button>
              </TooltipUi>
              <TooltipUi description={t('align_right')}>
                <button
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  className={`bg-transparent ${editor.isActive({ textAlign: 'right' }) ? 'bg-purple-500 hover:bg-purple-600 hover:text-primary-neutral-50' : 'hover:bg-gray-200 bg-transparent text-primary-neutral-900'} rounded-md text-sm font-medium underline size-8 flex items-center justify-center`}
                >
                  <AlignRight className='size-4' />
                </button>
              </TooltipUi>
            </div>
          </BubbleMenu>
        )}
        <EditorContent
          key={key}
          editor={editor}
          className={cn('focus-visible:outline-none shadow-none', className)}
          onBlur={(e) => {
            onBlur?.(e);
          }}
          onFocus={(e) => {
            onFocus?.(e);
          }}
        />
      </>
    );
  }
);

export default TiptapEditor;
