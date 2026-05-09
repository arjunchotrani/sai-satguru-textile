'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';

interface SmartLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
    prefetchType?: 'product' | 'category' | 'none';
    prefetchId?: string;
    targetComponent?: () => Promise<unknown>;
}

export const SmartLink = React.forwardRef<HTMLAnchorElement, SmartLinkProps>(({
    onMouseEnter,
    onMouseLeave,
    onTouchStart,
    children,
    ...props
}, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { prefetchType, prefetchId, targetComponent, ...linkProps } = props;

    return (
        <Link 
            {...linkProps} 
            ref={ref}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            prefetch={true}
        >
            {children}
        </Link>
    );
});

SmartLink.displayName = 'SmartLink';
