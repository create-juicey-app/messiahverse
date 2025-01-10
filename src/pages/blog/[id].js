import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

const MDPreview = dynamic(
  () => import('@uiw/react-markdown-preview'),
  { ssr: false }
);

export default function BlogPost({ post }) {
  if (!post) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-primary mb-8">{post.title}</h1>
      <div className="prose prose-purple max-w-none">
        <MDPreview source={post.content} />
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const client = await clientPromise;
  const db = client.db();
  
  const post = await db.collection('posts').findOne({
    _id: new ObjectId(params.id)
  });

  return {
    props: {
      post: JSON.parse(JSON.stringify(post))
    }
  };
}
