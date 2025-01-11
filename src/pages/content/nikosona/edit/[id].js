import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { uploadImage, extractImages } from '../../../../utils/imageUpload';
import { validateImage, validatePost } from '../../../../utils/validators';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import DraggableImage from '../../../../components/DraggableImage';

const AdvancedEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

export default function EditPost({ post }) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [featuredImage, setFeaturedImage] = useState(post.metadata?.featuredImage);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePositions, setImagePositions] = useState(post.metadata?.imagePositions || {});
  const { data: session } = useSession();
  const router = useRouter();
  const [preview, setPreview] = useState(false);

  // Protect the route
  useEffect(() => {
    if (session?.user?.id !== post.authorId) {
      router.push('/');
    }
  }, [session, post.authorId]);

  useEffect(() => {
    // Decode HTML entities when loading content
    const textarea = document.createElement('textarea');
    textarea.innerHTML = post.content;
    setContent(textarea.value);
  }, [post.content]);

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      validateImage(file);
      const imageUrl = await uploadImage(file);
      // Change to simple markdown format
      const imageMarkdown = `![${file.name}](${imageUrl})`;
      setContent(prev => prev + '\n' + imageMarkdown);
      // Store position separately in state
      setImagePositions(prev => ({
        ...prev,
        [imageUrl]: { x: 0, y: 0 }
      }));
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdate = async () => {
    try {
      validatePost(title, content);
      const metadata = {
        format: 'markdown',
        featuredImage,
        images: extractImages(content),
        layout: 'standard',
        imagePositions
      };

      const response = await fetch(`/api/posts/${post._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          metadata
        }),
      });

      if (response.ok) {
        router.push(`/content/nikosona/${post._id}`);
      } else {
        throw new Error('Failed to update post');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const renderPreview = () => {
    const images = imagePositions || {};
    return (
      <div className="relative min-h-[500px] border rounded-lg p-4 bg-surface/50">
        {Object.entries(images).map(([src, position]) => (
          <DraggableImage
            key={src}
            src={src}
            initialPosition={position}
            onPositionChange={(newPos) => {
              setImagePositions(prev => ({
                ...prev,
                [src]: newPos
              }));
            }}
          />
        ))}
        <MDPreview
          source={content}
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm, remarkEmoji]}
        />
      </div>
    );
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

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setPreview(false)}
          className={`px-4 py-2 rounded ${!preview ? 'bg-primary text-white' : 'bg-surface'}`}
        >
          Edit
        </button>
        <button
          onClick={() => setPreview(true)}
          className={`px-4 py-2 rounded ${preview ? 'bg-primary text-white' : 'bg-surface'}`}
        >
          Preview
        </button>
      </div>

      {preview ? renderPreview() : (
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
      )}

      <div className="flex gap-4 mt-4">
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Update Post
        </button>
        <button
          onClick={() => router.push(`/content/nikosona/${post._id}`)}
          className="px-4 py-2 bg-surface text-foreground border border-border rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const db = await getDb();
  
  const post = await db.collection('posts').findOne({
    _id: new ObjectId(params.id)
  });

  if (!post) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      post: JSON.parse(JSON.stringify(post))
    }
  };
}
