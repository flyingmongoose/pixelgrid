// src/components/Whitepaper.tsx

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './Whitepaper.module.css';

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => <p>Loading...</p>
});

export function Whitepaper() {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    import('./whitepaperContent').then((module) => {
      setContent(module.markdownContent);
    });
  }, []);

  if (!content) {
    return <div>Loading whitepaper...</div>;
  }

  return (
    <div className={`max-w-4xl mx-auto px-8 py-12 bg-white shadow-lg rounded-lg mt-6 mb-6 pt-4 pb-4 ${styles.pixelBorder}`}>
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-4xl font-bold mb-6 text-center" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mb-4" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-semibold mb-2" {...props} />,
          p: ({node, ...props}) => <p className="mb-4" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
