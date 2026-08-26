import React from 'react';

export const FaSharechat = ({ size = 20, className = "", ...props }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="8.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://w3.org"
            aria-hidden="true"
            {...props}
        >
            {/* Outer rounded diamond frame matching the gray layout perfectly */}
            <rect
                x="18"
                y="18"
                width="64"
                height="64"
                rx="22"
                transform="rotate(45 50 50)"
            />

            {/* Interlocking internal line geometry segments */}
            <path d="M33 46.5 L46.5 33" />
            <path d="M33 60.5 L60.5 33" />
            <path d="M46.5 71 L71 46.5" />
            <path d="M60.5 71 L71 60.5" />
            <path d="M46.5 46.5 L60.5 60.5" />
        </svg>
    );
};
