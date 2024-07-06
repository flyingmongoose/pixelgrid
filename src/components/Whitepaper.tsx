// src/components/Whitepaper.tsx

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './Whitepaper.module.css';
import type { Components } from 'react-markdown';
import type { Element, Text } from 'hast';

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => <p>Loading...</p>
});

type ListItemContent = Element | Text;

const renderListItemContent = (content: ListItemContent): React.ReactNode => {
  if (content.type === 'text') {
    return content.value;
  }
  if (content.type === 'element') {
    switch (content.tagName) {
      case 'strong':
        return <strong>{content.children.map((child, index) => <React.Fragment key={index}>{renderListItemContent(child as ListItemContent)}</React.Fragment>)}</strong>;
      case 'em':
        return <em>{content.children.map((child, index) => <React.Fragment key={index}>{renderListItemContent(child as ListItemContent)}</React.Fragment>)}</em>;
      case 'ul':
        return renderNestedList(content);
      case 'p':
        return content.children.map((child, index) => <React.Fragment key={index}>{renderListItemContent(child as ListItemContent)}</React.Fragment>);
      default:
        return content.children.map((child, index) => <React.Fragment key={index}>{renderListItemContent(child as ListItemContent)}</React.Fragment>);
    }
  }
  return null;
};

const renderNestedList = (list: Element): React.ReactNode => {
  return (
    <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
      {list.children.map((item, index) => {
        if (item.type === 'element' && item.tagName === 'li') {
          return (
            <li key={index} className="mb-0">
              {item.children.map((child, childIndex) => (
                <React.Fragment key={childIndex}>
                  {renderListItemContent(child as ListItemContent)}
                </React.Fragment>
              ))}
            </li>
          );
        }
        return null;
      })}
    </ul>
  );
};

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

  const components: Partial<Components> = {
    h1: ({node, ...props}) => <h1 className="text-4xl font-bold mb-6 text-center" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mb-4" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-xl font-semibold mb-2" {...props} />,
    p: ({node, ...props}) => <p className="mb-2" {...props} />,
    a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
    li: ({node, children, ...props}) => {
      if (!node || node.type !== 'element' || node.tagName !== 'li') {
        return <li className="mb-0" {...props}>{children}</li>;
      }

      const hasNestedList = node.children.some(
        child => child.type === 'element' && child.tagName === 'ul'
      );

      return (
        <li className="mb-0" {...props}>
          {node.children.map((child, index) => (
            <React.Fragment key={index}>
              {child.type === 'element' && child.tagName === 'ul'
                ? renderNestedList(child)
                : renderListItemContent(child as ListItemContent)}
            </React.Fragment>
          ))}
          {hasNestedList && <br />}
        </li>
      );
    },
    hr: () => <hr className={styles.rainbowHr} />,
  };

  return (
    <div className={`max-w-4xl mx-auto px-8 py-12 bg-white shadow-lg rounded-lg mt-6 mb-2 pt-4 pb-4 ${styles.pixelBorder}`}>
      <div className="markdown-content">
        <ReactMarkdown components={components}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
