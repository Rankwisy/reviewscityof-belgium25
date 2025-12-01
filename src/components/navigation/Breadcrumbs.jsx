import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link
              to={createPageUrl('Home')}
              className="text-gray-500 hover:text-[var(--primary-orange)] transition-colors flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>
          
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <React.Fragment key={index}>
                <li>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </li>
                <li>
                  {isLast ? (
                    <span className="text-gray-900 font-medium line-clamp-1">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.url}
                      className="text-gray-500 hover:text-[var(--primary-orange)] transition-colors line-clamp-1"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}