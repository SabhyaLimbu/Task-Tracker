import React from 'react';

const Button = ({
  children,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  ...props
}) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
 const variants = {
  primary: 'bg-pink-400 text-white hover:bg-pink-500 focus:ring-pink-300',
  secondary: 'bg-lavender-200 text-purple-700 hover:bg-lavender-300 focus:ring-purple-300',
  outline: 'border border-pink-300 bg-white text-pink-500 hover:bg-pink-50 focus:ring-pink-300',
  text: 'bg-transparent text-rose-400 hover:text-rose-600 hover:bg-rose-100 focus:ring-rose-300',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400',
};

  const buttonClasses = `${baseStyles} ${variants[variant] || variants.primary} ${className}`;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;