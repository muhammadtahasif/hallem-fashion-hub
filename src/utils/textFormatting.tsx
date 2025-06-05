
import React from 'react';

export const formatDescription = (description: string): JSX.Element[] => {
  if (!description) return [];
  
  const lines = description.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Handle markdown-style bold text (**text**)
    const parts = line.split(/(\*\*.*?\*\*)/g);
    
    const formattedParts = parts.map((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={`${lineIndex}-${partIndex}`}>{boldText}</strong>;
      }
      return part;
    });
    
    return (
      <span key={lineIndex}>
        {formattedParts}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
};
