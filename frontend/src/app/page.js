'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import PinBoard from '../components/PinBoard';
import UserList from '../components/UserList';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from "@/components/ui/input"
import { Plus, Hash, Users2Icon } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function Home() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [users, setUsers] = useState([]);
  const [pins, setPins] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  const createRoom = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    if (!username.trim()) return;

    try {
      const response = await fetch('http://localhost:8000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      setRoomId(data.room_id);
      setCurrentUser({ id: data.user_id, username, color: getRandomColor() });
      connectWebSocket(data.room_id, data.user_id, username);
      setIsInRoom(true);
    } catch (error) {
      toast.error("Error creating room !")
      setIsCreating(false);
      console.error('Error creating room:', error);
    }
    setIsCreating(false);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    setIsJoining(true);
    if (!username.trim() || !roomId) return;
    const userId = `user-${Date.now()}`;
    setCurrentUser({ id: userId, username, color: getRandomColor() });
    connectWebSocket(roomId, userId, username);
  };

  const connectWebSocket = (roomId, userId, username) => {
    const socket = new WebSocket(`ws://localhost:8000/ws/${roomId}?username=${encodeURIComponent(username)}`);
    
    socket.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Message received:', message);
      if(message.type === 'error') {
        toast.error(message.message);
        return;
      }else{
        setIsJoining(false)
        setIsInRoom(true)
      }
      switch (message.type) {
        case 'init':
         
          setPins(message.pins || []);
          setUsers(message.users || []);
          break;
        case 'pin_created':
          setPins(prev => [...prev, message.pin]);
          break;
        case 'pin_updated':
          setPins(prev => 
            prev.map(pin => 
              pin.id === message.pin.id ? { ...pin, ...message.pin } : pin
            )
          );
          break;
        case 'pin_deleted':
          setPins(prev => prev.filter(pin => pin.id !== message.pin_id));
          break;
        case 'user_joined':
          setUsers(prev => [...prev, message.user]);
          break;
        case 'user_left':
          setUsers(prev => prev.filter(user => user.id !== message.user_id));
          break;
        case 'cursor_moved':
          setUsers(prev => 
            prev.map(user => 
              user.id === message.user_id 
                ? { ...user, cursor: message.cursor } 
                : user
            )
          );
          break;
      }
    };

    socket.onclose = () => {
      setIsInRoom(false)
      setIsJoining(false)
      console.log('WebSocket disconnected');
    };

    ws.current = socket;
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  };

  const handleCreatePin = (x, y) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    ws.current.send(JSON.stringify({
      action: 'pin_create',
      x,
      y,
      text: 'New Note'
    }));
  };

  const handleUpdatePin = (pinId, updates) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    ws.current.send(JSON.stringify({
      action: 'pin_update',
      id: pinId,
      ...updates
    }));
  };

  const handleDeletePin = (pinId) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    ws.current.send(JSON.stringify({
      action: 'pin_delete',
      id: pinId
    }));
  };

  const handleCursorMove = useCallback((x, y) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    ws.current.send(JSON.stringify({
      action: 'cursor_move',
      x,
      y
    }));
  }, []);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  if (!isInRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Title Section */}
          <div className="text-center mb-8">
            {/* Logo and Name */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-20 h-20 relative">
                <Image
                  src="/logo.svg"
                  alt="Notify Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-6xl pb-6 font-extrabold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
                Notify
              </span>
            </div>
            <p className="text-slate-600 mt-2">
              Collaborate in real-time with your team
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Get Started</CardTitle>
              <CardDescription>
                Create a new board or join an existing one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="create" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create
                  </TabsTrigger>
                  <TabsTrigger value="join" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Join
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-4">
                  <form onSubmit={createRoom} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="create-username" className="text-sm font-medium">
                         Name
                      </label>
                      <Input
                        id="create-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your name"
                        className="h-11"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-blue-500 hover:bg-blue-400"
                      disabled={!username.trim() || isCreating}
                    >
                      {isCreating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          
                          Create Workspace
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="join" className="space-y-4">
                  <form onSubmit={joinRoom} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="join-username" className="text-sm font-medium">
                        Name
                      </label>
                      <Input
                        id="join-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your name"
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="room-id" className="text-sm font-medium">
                        Workspace ID
                      </label>
                      <Input
                        id="room-id"
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Enter board ID"
                        className="h-11 font-mono"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="default"
                      className="w-full h-11 bg-blue-500 hover:bg-blue-400"
                      disabled={!username.trim() || !roomId.trim() || isJoining}
                    >
                      {isJoining ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2  border-t-transparent rounded-full animate-spin" />
                          Joining...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Join Workspace
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-slate-500">
            Start collaborating with your team in seconds
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="p-4 bg-white shadow flex justify-between items-center">
        <div className="flex flex-col items-start">
          <div className='flex flex-row items-center'>
            <Image src="/logo.svg" alt="Notify Logo" className="h-8 w-8" width={60} height={60} />
            <span className='ms-2 text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-blue-200 bg-clip-text text-transparent'>Notify</span>
          </div>
          <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
            Board ID: <code>{roomId}</code>
            <button
              type="button"
              aria-label="Copy Board ID"
              onClick={() => {
                if (roomId) {
                  navigator.clipboard.writeText(roomId);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }
              }}
              className="rounded hover:bg-gray-100 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>
            </button>
            {copied && <span className="text-green-500 text-xs">Copied!</span>}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="inline-flex items-center gap-2 mr-4">
            <span
              className={`inline-block w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}
              aria-label={isConnected ? 'Connected' : 'Disconnected'}
            />
            <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}
              >{isConnected ? 'Connected' : 'Disconnected'}</span>
          </span>
          <span className="inline-flex items-center gap-2"> <Users2Icon className="h-4 w-4"/>  {users.length + 1} online</span>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <PinBoard
          pins={pins}
          onCreatePin={handleCreatePin}
          onUpdatePin={handleUpdatePin}
          onDeletePin={handleDeletePin}
          onCursorMove={handleCursorMove}
          currentUser={currentUser}
          otherUsers={users}
        />
        <UserList users={[...users, currentUser]} currentUserId={currentUser?.id} />
      </div>
    </div>
  );
}