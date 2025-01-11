import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import UserMenu from '../../../components/Navigation/UserMenu';
import { useSession } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MDPreview = dynamic(
  () => import('@uiw/react-markdown-preview'),
  { ssr: false }
);

export default function BlogPost({ post }) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === post?.authorId;

  if (!post) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background/50 relative">
      <UserMenu currentPost={post} />
      
      <main className="container mx-auto px-4 py-20">
        <div className="bg-surface/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
          <div className="prose prose-invert max-w-none p-8">
            <MDPreview
              source={post.content}
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm, remarkEmoji]}
              className="!text-foreground"
              style={{
                backgroundColor: 'transparent',
                fontSize: '1.1rem',
                lineHeight: '1.75'
              }}
              components={{
                img: ({ node, ...props }) => (
                  <img
                    {...props}
                    className="rounded-lg shadow-md max-w-full mx-auto"
                    loading="lazy"
                  />
                )
              }}
            />
          </div>
        </div>
      </main>

      {isOwner && (
        <motion.div
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href={`/content/nikosona/edit/${post._id}`}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full 
                     shadow-lg hover:bg-primary/90 transition-colors"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="text-lg" />
            <span>Edit Post</span>
          </Link>
        </motion.div>
      )}
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const db = await getDb();
  
  const post = await db.collection('posts').findOne({
    _id: new ObjectId(params.id)
  });

  return {
    props: {
      post: JSON.parse(JSON.stringify(post))
    }
  };
}
