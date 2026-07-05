import { useCallback, useEffect, useRef } from 'react';
import { Bold, Italic, Link2, List, ListOrdered, Underline } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sanitizeNewsletterHtml } from '@/lib/signalNewsletterBlocks';

type NewsletterRichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
};

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function NewsletterRichTextEditor({
  value,
  onChange,
  placeholder = 'Write here…',
  className,
  minHeight = '120px',
}: NewsletterRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    onChange(sanitizeNewsletterHtml(el.innerHTML));
  }, [onChange]);

  const addLink = () => {
    const url = window.prompt('Link URL (https://…)');
    if (!url?.trim()) return;
    const href = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    exec('createLink', href);
    emitChange();
  };

  return (
    <div className={cn('overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-1.5 dark:border-gray-700 dark:bg-gray-900/50">
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('bold'); emitChange(); }} aria-label="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('italic'); emitChange(); }} aria-label="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('underline'); emitChange(); }} aria-label="Underline">
          <Underline className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={addLink} aria-label="Insert link">
          <Link2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('insertUnorderedList'); emitChange(); }} aria-label="Bullet list">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => { exec('insertOrderedList'); emitChange(); }} aria-label="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        className="newsletter-rich-text min-w-0 bg-white p-3 text-sm text-gray-900 outline-none dark:bg-gray-950 dark:text-gray-100"
        style={{ minHeight }}
        onInput={emitChange}
        onBlur={emitChange}
      />
    </div>
  );
}
