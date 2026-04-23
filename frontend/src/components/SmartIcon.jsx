import React from 'react';

/**
 * SmartIcon - A reusable icon wrapper for Lucide icons
 * Styles icons to feel like Google keyboard emojis:
 * Clean, expressive, slightly bold, and friendly.
 * 
 * @param {Object} props
 * @param {React.ElementType} props.icon - The Lucide icon component
 * @param {number} [props.size=22] - Icon size
 * @param {number} [props.strokeWidth=2.2] - Stroke thickness (default 2.2 for "emoji" feel)
 * @param {string} [props.className=""] - Additional classes for the wrapper
 * @param {string} [props.color] - Custom color (defaults to currentColor)
 * @param {boolean} [props.variant="ghost"] - "ghost", "soft", or "none"
 */
const SmartIcon = ({ 
  icon: Icon, 
  size = 22, 
  strokeWidth = 2.2, 
  className = "", 
  variant = "none",
  color,
  ...props 
}) => {
  if (!Icon) return null;

  const variantClasses = {
    none: "",
    ghost: "icon-ghost",
    soft: "icon-soft"
  };

  return (
    <div className={`smart-icon-wrapper ${variantClasses[variant]} ${className}`} {...props}>
      <Icon 
        size={size} 
        strokeWidth={strokeWidth} 
        color={color || "currentColor"}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default SmartIcon;
