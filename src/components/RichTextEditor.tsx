import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Image as ImageIcon,
  Link as LinkIcon, Undo, Redo, Type, X, Check, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================
// Toolbar Button Component
// ============================================

interface ToolbarButtonProps {
  icon: React.ElementType;
  isActive?: boolean;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}

function ToolbarButton({ icon: Icon, isActive, onClick, title, disabled }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded-lg transition-all
        ${isActive 
          ? 'bg-orange-500 text-white' 
          : 'text-slate-400 hover:text-white hover:bg-slate-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

// ============================================
// Toolbar Component
// ============================================

function EditorToolbar({ editor }: { editor: Editor | null }) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('輸入圖片網址：');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setShowLinkInput(false);
  };

  return (
    <div className="border-b border-slate-700 bg-slate-800/50 p-2">
      {/* Text Style */}
      <div className="flex flex-wrap items-center gap-1">
        <div className="flex items-center gap-0.5 bg-slate-900/50 rounded-lg p-1">
          <ToolbarButton
            icon={Bold}
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="粗體"
          />
          <ToolbarButton
            icon={Italic}
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="斜體"
          />
          <ToolbarButton
            icon={Strikethrough}
            isActive={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="刪除線"
          />
          <ToolbarButton
            icon={Code}
            isActive={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="程式碼"
          />
        </div>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        {/* Headings */}
        <div className="flex items-center gap-0.5 bg-slate-900/50 rounded-lg p-1">
          <ToolbarButton
            icon={Heading1}
            isActive={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="標題 1"
          />
          <ToolbarButton
            icon={Heading2}
            isActive={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="標題 2"
          />
          <ToolbarButton
            icon={Heading3}
            isActive={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="標題 3"
          />
        </div>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        {/* Lists */}
        <div className="flex items-center gap-0.5 bg-slate-900/50 rounded-lg p-1">
          <ToolbarButton
            icon={List}
            isActive={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="項目符號列表"
          />
          <ToolbarButton
            icon={ListOrdered}
            isActive={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="編號列表"
          />
          <ToolbarButton
            icon={Quote}
            isActive={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="引用"
          />
        </div>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        {/* Media */}
        <div className="flex items-center gap-0.5 bg-slate-900/50 rounded-lg p-1">
          <ToolbarButton
            icon={ImageIcon}
            onClick={addImage}
            title="插入圖片"
          />
          <div className="relative">
            <ToolbarButton
              icon={LinkIcon}
              isActive={editor.isActive('link')}
              onClick={() => {
                if (editor.isActive('link')) {
                  removeLink();
                } else {
                  setShowLinkInput(true);
                }
              }}
              title="插入連結"
            />
            <AnimatePresence>
              {showLinkInput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 w-64"
                >
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm mb-2 focus:border-orange-500 focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && setLink()}
                  />
                  <div className="flex gap-2">
                    <Button onClick={setLink} size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600">
                      <Check className="w-3 h-3 mr-1" /> 確認
                    </Button>
                    <Button onClick={() => setShowLinkInput(false)} size="sm" variant="ghost">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        {/* History */}
        <div className="flex items-center gap-0.5 bg-slate-900/50 rounded-lg p-1">
          <ToolbarButton
            icon={Undo}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="復原"
          />
          <ToolbarButton
            icon={Redo}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="重做"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Rich Text Editor Component
// ============================================

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content = '',
  onChange,
  placeholder = '開始輸入內容...',
  minHeight = '300px',
}: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
      <EditorToolbar editor={editor} />
      
      <div className="relative">
        <EditorContent
          editor={editor}
          className="prose prose-invert max-w-none p-4 focus:outline-none"
          style={{ minHeight }}
        />
        
        {/* Preview Mode */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900 p-4 overflow-auto"
              style={{ minHeight }}
            >
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 bg-slate-800/50 px-4 py-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>{editor.storage.characterCount?.characters?.() || 0} 字元</span>
          <span>{editor.storage.characterCount?.words?.() || 0} 單字</span>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? '編輯' : '預覽'}
        </button>
      </div>

      <style>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #64748b;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror img {
          max-width: 100%;
          border-radius: 0.5rem;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #f97316;
          padding-left: 1rem;
          margin-left: 0;
          color: #94a3b8;
        }
        .ProseMirror pre {
          background: #1e293b;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        .ProseMirror code {
          background: #1e293b;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        .ProseMirror a {
          color: #f97316;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

// ============================================
// Announcement Editor Modal
// ============================================

interface AnnouncementEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; pinned: boolean }) => void;
  initialData?: { title: string; content: string; pinned: boolean };
}

export function AnnouncementEditor({
  isOpen,
  onClose,
  onSave,
  initialData = { title: '', content: '', pinned: false },
}: AnnouncementEditorProps) {
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [pinned, setPinned] = useState(initialData.pinned);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ title, content, pinned });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Type className="w-5 h-5 text-orange-500" />
            {initialData.title ? '編輯公告' : '新增公告'}
          </h3>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-sm text-slate-400">置頂</span>
            </label>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              公告標題
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
              placeholder="輸入公告標題..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              公告內容
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="輸入公告內容..."
              minHeight="400px"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-orange-500 hover:bg-orange-600"
            disabled={!title.trim()}
          >
            <Check className="w-4 h-4 mr-1" />
            發布公告
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
