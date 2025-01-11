import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false });
const MarkdownEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

// Add custom styles programmatically
const customStyles = `
  .w-md-editor {
    background-color: transparent !important;
  }
  .wmde-markdown {
    background-color: transparent !important;
  }
`;

export function Preview({ ...props }) {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = customStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return <MarkdownPreview {...props} />;
}

export function Editor({ ...props }) {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = customStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return <MarkdownEditor {...props} />;
}
