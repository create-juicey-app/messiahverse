import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import MarkdownEditor from '../components/MarkdownEditor';

export default function NewPost() {
  const [title, setTitle] = useState('');
  const { data: session } = useSession();
  const router = useRouter();

  const handleSave = async (content) => {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        authorId: session.user.id,
      }),
    });

    if (response.ok) {
      router.push('/blog');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post Title"
        className="w-full p-2 mb-4 border border-border rounded"
      />
      <MarkdownEditor onSave={handleSave} />
    </div>
  );
}
