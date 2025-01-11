import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { uploadImage } from '../../../utils/imageUpload';
import { validateImage, validatePost } from '../../../utils/validators';
import { extractImages } from '../../../utils/imageUpload';

const AdvancedEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

export default function NewPost() {
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      validateImage(file);
      const imageUrl = await uploadImage(file);
      const imageMarkdown = `![${file.name}](${imageUrl})`;
      setContent(prev => prev + '\n' + imageMarkdown);
    } catch (error) {
      alert(error.message);
      console.error('Image upload failed:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      validatePost(content);
      const metadata = {
        format: 'markdown',
        images: extractImages(content),
        layout: 'standard'
      };

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          authorId: session.user.id,
          metadata
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.insertedId) {
        await router.push(`/content/nikosona/${data.insertedId}`);
      } else {
        throw new Error(data.error || 'Failed to create post');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files[0])}
          disabled={uploadingImage}
          className="mb-2"
        />
        {uploadingImage && <p>Uploading image...</p>}
      </div>

      <AdvancedEditor
        value={content}
        onChange={setContent}
        preview="edit"
        height={500}
        toolbarCommands={[
          'bold', 'italic', 'strikethrough',
          'heading', 'quote', 'code',
          'link', 'image',
          'unordered-list', 'ordered-list',
          'table', 'emoji'
        ]}
      />

      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-primary text-white rounded"
      >
        Publish Post
      </button>
    </div>
  );
}
