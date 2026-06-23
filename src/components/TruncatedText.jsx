import React from 'react';
import Tooltip from '@mui/material/Tooltip';

/**
 * TruncatedText - A reusable component that truncates text with ellipsis
 * and shows full text in a tooltip on hover
 *
 * @param {string} text - The text to display
 * @param {string} className - Additional CSS classes
 * @param {number} maxLines - Maximum number of lines before truncating (default: 1)
 * @param {object} style - Additional inline styles
 * @param {string} as - HTML element type (default: 'div')
 */
const TruncatedText = ({
  text,
  className = '',
  maxLines = 1,
  style = {},
  tooltipPlacement = 'top',
  as = 'div'
}) => {
  if (!text) return null;

  const truncateStyle = {
    display: '-webkit-box',
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word',
    width: '100%',
    ...style
  };

  const Component = as;

  return (
    <Tooltip
      title={text}
      placement={tooltipPlacement}
      arrow
      enterDelay={300}
      leaveDelay={0}
    >
      <Component
        className={className}
        style={truncateStyle}
      >
        {text}
      </Component>
    </Tooltip>
  );
};

export default TruncatedText;
