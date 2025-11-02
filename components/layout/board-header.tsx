'use client';

import { Star, Users, MoreHorizontal, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BoardHeaderProps {
  title: string;
}

export function BoardHeader({ title }: BoardHeaderProps) {
  return (
    <div className="h-12 flex items-center px-3 gap-2 bg-black/10 backdrop-blur-sm">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {/* Board Title */}
        <h1 className="text-white font-bold text-lg px-3 py-1 hover:bg-white/20 rounded cursor-pointer transition-colors">
          {title}
        </h1>

        {/* Star Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 h-8 w-8"
          disabled
          title="Star this board"
        >
          <Star className="w-4 h-4" />
        </Button>

        {/* Visibility Button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 h-8 px-3 text-sm"
          disabled
          title="Board visibility"
        >
          <Lock className="w-3 h-3 mr-1" />
          Private
        </Button>

        {/* Board Members - Placeholder */}
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white/20">
            U
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-2">
        {/* Automation Button - Placeholder */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 h-8 px-3 text-sm"
          disabled
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Automation
        </Button>

        {/* Filter Button - Placeholder */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 h-8 px-3 text-sm"
          disabled
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          Filter
        </Button>

        <div className="w-px h-6 bg-white/30" />

        {/* Share Button */}
        <Button
          size="sm"
          className="bg-blue-500 hover:bg-blue-400 text-white h-8 px-3 text-sm"
          disabled
        >
          <Users className="w-4 h-4 mr-1" />
          Share
        </Button>

        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 h-8 w-8"
          disabled
          title="Show menu"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
