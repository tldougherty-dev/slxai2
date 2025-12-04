import React from 'react';
import { detectURLs } from '@/lib/urlPreview';

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  // Decode HTML entities safely
  const decodeHtmlEntities = (text: string): string => {
    if (typeof document === 'undefined') {
      // Server-side rendering fallback - decode all HTML entities
      return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&#47;/g, '/');
    }
    // SECURITY: Use DOMParser to safely decode HTML entities without executing scripts
    // This is safe because we're only decoding entities, not rendering HTML
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${text}</div>`, 'text/html');
      return doc.body.textContent || doc.body.innerText || text;
    } catch {
      // Fallback to manual replacement if DOMParser fails
      return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&#47;/g, '/');
    }
  };

  // Parse content and render URLs as clickable links
  const renderContent = () => {
    const decodedContent = decodeHtmlEntities(content);
    const urls = detectURLs(decodedContent);
    
    if (urls.length === 0) {
      // No URLs, just render the text
      return <span className="whitespace-pre-wrap">{decodedContent}</span>;
    }

    // Split content by URLs and render with clickable links
    const parts: (string | { type: 'url'; url: string })[] = [];
    let lastIndex = 0;
    
    urls.forEach((url) => {
      const urlIndex = decodedContent.indexOf(url, lastIndex);
      if (urlIndex > lastIndex) {
        // Add text before URL
        parts.push(decodedContent.substring(lastIndex, urlIndex));
      }
      // Add URL
      parts.push({ type: 'url', url });
      lastIndex = urlIndex + url.length;
    });
    
    // Add remaining text after last URL
    if (lastIndex < decodedContent.length) {
      parts.push(decodedContent.substring(lastIndex));
    }

    return (
      <span className="whitespace-pre-wrap">
        {parts.map((part, index) => {
          if (typeof part === 'string') {
            return <span key={index}>{part}</span>;
          } else {
            return (
              <a
                key={index}
                href={part.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline break-all"
              >
                {part.url}
              </a>
            );
          }
        })}
      </span>
    );
  };

  return <div className="text-sm text-gray-900 dark:text-white">{renderContent()}</div>;
}

