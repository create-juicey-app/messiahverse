import { useState } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

export default function MarkdownEditor({ initialValue = '', onSave }) {
  const [value, setValue] = useState(initialValue);
  const { data: session } = useSession();

  const toolbarCommands = [
    'bold', 'italic', 'strikethrough',
    'title', 'quote', 'code',
    'link', 'image',
    'unordered-list', 'ordered-list',
    'table'
  ];

  const handleSave = async () => {
    if (!session) return;
    await onSave(value);
  };

  return (
    <div className="w-full space-y-4">
      <MDEditor
        value={value}
        onChange={setValue}
        commands={toolbarCommands}
        preview="edit"
        className="min-h-[500px]"
      />
      <button
        onClick={handleSave}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
      >
        Save Post
      </button>
    </div>
  );
}
