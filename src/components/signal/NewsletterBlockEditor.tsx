import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Copy,
  GripVertical,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';
import { uploadNewsletterImage } from '@/lib/newsletterMedia';
import {
  NEWSLETTER_BLOCK_OPTIONS,
  createBlock,
  getSectionLabel,
  parseVideoEmbed,
  type NewsletterBlock,
  type NewsletterBlockType,
  type SignalNewsletterDocument,
} from '@/lib/signalNewsletterBlocks';
import { SIGNAL_NEWSLETTER_SECTIONS } from '@/lib/signalNewsletterTemplate';
import { NewsletterRichTextEditor } from '@/components/signal/NewsletterRichTextEditor';
import { useToast } from '@/hooks/use-toast';

type NewsletterBlockEditorProps = {
  document: SignalNewsletterDocument;
  onChange: (document: SignalNewsletterDocument) => void;
};

export function NewsletterBlockEditor({ document, onChange }: NewsletterBlockEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const updateBlocks = (blocks: NewsletterBlock[]) => {
    onChange({ ...document, blocks });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = document.blocks.findIndex((b) => b.id === active.id);
    const newIndex = document.blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    updateBlocks(arrayMove(document.blocks, oldIndex, newIndex));
  };

  const addBlock = (type: NewsletterBlockType) => {
    updateBlocks([...document.blocks, createBlock(type)]);
  };

  const updateBlock = (id: string, patch: Partial<NewsletterBlock>) => {
    updateBlocks(document.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const removeBlock = (id: string) => {
    updateBlocks(document.blocks.filter((b) => b.id !== id));
  };

  const duplicateBlock = (id: string) => {
    const index = document.blocks.findIndex((b) => b.id === id);
    if (index < 0) return;
    const copy = { ...document.blocks[index], id: crypto.randomUUID() };
    const next = [...document.blocks];
    next.splice(index + 1, 0, copy);
    updateBlocks(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Newsletter content</h3>
          <p className="text-sm text-gray-500">Drag blocks to reorder. Add images, videos, quotes, and CTAs.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add block
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Block type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {NEWSLETTER_BLOCK_OPTIONS.map((opt) => (
              <DropdownMenuItem key={opt.type} onClick={() => addBlock(opt.type)}>
                <div>
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.description}</div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={document.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {document.blocks.map((block) => (
              <SortableNewsletterBlock
                key={block.id}
                block={block}
                onChange={(patch) => updateBlock(block.id, patch)}
                onRemove={() => removeBlock(block.id)}
                onDuplicate={() => duplicateBlock(block.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {document.blocks.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
          No blocks yet. Use &quot;Add block&quot; to start building your issue.
        </p>
      )}
    </div>
  );
}

type SortableNewsletterBlockProps = {
  block: NewsletterBlock;
  onChange: (patch: Partial<NewsletterBlock>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
};

function SortableNewsletterBlock({ block, onChange, onRemove, onDuplicate }: SortableNewsletterBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeLabel = NEWSLETTER_BLOCK_OPTIONS.find((o) => o.type === block.type)?.label ?? block.type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900/40',
        isDragging && 'z-10 opacity-90 ring-2 ring-electric-blue/40',
      )}
    >
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 dark:border-gray-800">
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing dark:hover:bg-gray-800"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{typeLabel}</span>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate} aria-label="Duplicate block">
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={onRemove} aria-label="Remove block">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="p-4">
        <BlockFields block={block} onChange={onChange} />
      </div>
    </div>
  );
}

function BlockFields({ block, onChange }: { block: NewsletterBlock; onChange: (patch: Partial<NewsletterBlock>) => void }) {
  switch (block.type) {
    case 'section':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Template section</Label>
            <Select
              value={block.sectionKey ?? 'editors_note'}
              onValueChange={(v) => onChange({ sectionKey: v as typeof block.sectionKey, customSectionTitle: '' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIGNAL_NEWSLETTER_SECTIONS.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Custom title (optional)</Label>
            <Input
              value={block.customSectionTitle ?? ''}
              onChange={(e) => onChange({ customSectionTitle: e.target.value })}
              placeholder={block.sectionKey ? getSectionLabel(block.sectionKey) : 'Section title'}
            />
          </div>
        </div>
      );
    case 'text':
      return (
        <NewsletterRichTextEditor
          value={block.html ?? ''}
          onChange={(html) => onChange({ html })}
          placeholder="Write your copy…"
          minHeight="140px"
        />
      );
    case 'quote':
      return (
        <div className="space-y-3">
          <NewsletterRichTextEditor
            value={block.html ?? ''}
            onChange={(html) => onChange({ html })}
            placeholder="Pull quote text…"
            minHeight="100px"
          />
          <div className="space-y-2">
            <Label>Attribution (optional)</Label>
            <Input
              value={block.quoteAttribution ?? ''}
              onChange={(e) => onChange({ quoteAttribution: e.target.value })}
              placeholder="Name or source"
            />
          </div>
        </div>
      );
    case 'image':
      return <ImageBlockFields block={block} onChange={onChange} />;
    case 'video':
      return <VideoBlockFields block={block} onChange={onChange} />;
    case 'button':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Button label</Label>
            <Input value={block.buttonLabel ?? ''} onChange={(e) => onChange({ buttonLabel: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Link URL</Label>
            <Input
              value={block.buttonUrl ?? ''}
              onChange={(e) => onChange({ buttonUrl: e.target.value })}
              placeholder="https:// or /academy"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Style</Label>
            <Select
              value={block.buttonStyle ?? 'primary'}
              onValueChange={(v) => onChange({ buttonStyle: v as 'primary' | 'outline' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary (blue)</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    case 'spacer':
      return (
        <div className="space-y-2">
          <Label>Spacer size</Label>
          <Select
            value={block.spacerSize ?? 'md'}
            onValueChange={(v) => onChange({ spacerSize: v as 'sm' | 'md' | 'lg' })}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    case 'divider':
      return <p className="text-sm text-gray-500">A horizontal divider appears on the published page.</p>;
    default:
      return null;
  }
}

function ImageBlockFields({ block, onChange }: { block: NewsletterBlock; onChange: (patch: Partial<NewsletterBlock>) => void }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    const user = getCurrentUser();
    if (!user?.id) {
      toast({ title: 'Sign in required', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadNewsletterImage(file, user.id);
      onChange({ imageUrl: url });
      toast({ title: 'Image uploaded' });
    } catch (e) {
      toast({
        title: 'Upload failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {block.imageUrl && (
        <img src={block.imageUrl} alt={block.alt || ''} className="max-h-48 rounded-lg border object-contain" />
      )}
      <div className="flex flex-wrap gap-2">
        <Label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload image
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
          />
        </Label>
      </div>
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          value={block.imageUrl ?? ''}
          onChange={(e) => onChange({ imageUrl: e.target.value })}
          placeholder="https://… or upload above"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Alt text</Label>
          <Input value={block.alt ?? ''} onChange={(e) => onChange({ alt: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Alignment</Label>
          <Select
            value={block.imageAlign ?? 'center'}
            onValueChange={(v) => onChange({ imageAlign: v as 'left' | 'center' | 'full' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="full">Full width</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Caption (optional)</Label>
        <Textarea value={block.caption ?? ''} onChange={(e) => onChange({ caption: e.target.value })} rows={2} />
      </div>
    </div>
  );
}

function VideoBlockFields({ block, onChange }: { block: NewsletterBlock; onChange: (patch: Partial<NewsletterBlock>) => void }) {
  const embed = block.videoUrl ? parseVideoEmbed(block.videoUrl) : null;
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>YouTube or Vimeo URL</Label>
        <Input
          value={block.videoUrl ?? ''}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=…"
        />
      </div>
      {embed ? (
        <div className="aspect-video overflow-hidden rounded-lg border bg-black/10">
          <iframe src={embed.embedUrl} title="Video preview" className="h-full w-full" allowFullScreen />
        </div>
      ) : block.videoUrl?.trim() ? (
        <p className="text-sm text-amber-600">Paste a valid YouTube or Vimeo link.</p>
      ) : (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <ImageIcon className="h-4 w-4" />
          Supports youtube.com and vimeo.com links
        </p>
      )}
    </div>
  );
}
