'use client';


import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

export default function UserList({ users = [], currentUserId }) {
  return (
    <div className="w-[250px] bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3>Online Users</h3>
      <ul>
        {users.map(user => (
          <li 
            key={user.username} 
            className={`flex items-center py-2 border-b border-gray-100 ${user.id === currentUserId ? 'font-medium' : ''}`}
          >
            <Avatar>
              <AvatarImage
                src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(user.username)}`}
                alt={user.username}
                className="w-8 h-8 "
              />
              <AvatarFallback>{user.username[0]?.toUpperCase() || '?'}</AvatarFallback>
            </Avatar>
            <span className="ml-2">
              {user.username}{user.id === currentUserId && ' (You)'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}