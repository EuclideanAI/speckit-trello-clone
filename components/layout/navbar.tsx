'use client';

import { Search, Plus, HelpCircle, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Navbar() {
  return (
    <nav className="h-12 bg-[#0C66E4] border-b border-blue-700 flex items-center px-3 gap-2">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {/* Trello Logo and Text */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-blue-600 font-bold text-base h-8 px-3"
        >
          <svg
            className="w-4 h-4 mr-1"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M21 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.3 3 3 3h18c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3zM10.4 16.5c0 .8-.7 1.5-1.5 1.5H6.5c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5h2.4c.8 0 1.5.7 1.5 1.5v9zm8.6-4.5c0 .8-.7 1.5-1.5 1.5h-2.4c-.8 0-1.5-.7-1.5-1.5v-4.5c0-.8.7-1.5 1.5-1.5h2.4c.8 0 1.5.7 1.5 1.5V12z" />
          </svg>
          Trello
        </Button>

        {/* Workspaces Dropdown - Placeholder */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-blue-600 h-8 px-3 text-sm"
          disabled
        >
          Workspaces
        </Button>

        {/* Recent Dropdown - Placeholder */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-blue-600 h-8 px-3 text-sm"
          disabled
        >
          Recent
        </Button>

        {/* Starred Dropdown - Placeholder */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-blue-600 h-8 px-3 text-sm"
          disabled
        >
          Starred
        </Button>

        {/* Templates Dropdown - Placeholder */}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-blue-600 h-8 px-3 text-sm"
          disabled
        >
          Templates
        </Button>

        {/* Create Button */}
        <Button
          size="sm"
          className="bg-blue-500 hover:bg-blue-400 text-white h-8 px-3 text-sm"
          disabled
        >
          <Plus className="w-4 h-4 mr-1" />
          Create
        </Button>
      </div>

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            className="h-8 w-48 pl-8 bg-blue-600/50 border-blue-700 text-white placeholder:text-blue-200 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400"
            disabled
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-blue-600 h-8 w-8"
          disabled
        >
          <Bell className="w-4 h-4" />
        </Button>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-blue-600 h-8 w-8"
          disabled
        >
          <HelpCircle className="w-4 h-4" />
        </Button>

        {/* User Profile */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-blue-600 h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600"
          disabled
        >
          <User className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
}
