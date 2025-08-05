'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Pin from './Pin';


export default function PinBoard({ 
  pins = [], 
  onCreatePin, 
  onUpdatePin, 
  onDeletePin,
  onCursorMove,
  currentUser,
  otherUsers = []
}) {
  const boardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPin, setDragPin] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDoubleClick = (e) => {
    if (!boardRef.current) return;
    
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onCreatePin(x, y);
  };

  const handleMouseDown = (e, pin) => {
    if (e.target.tagName === 'TEXTAREA') return;
    
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragPin(pin);
    setDragOffset({
      x: x - pin.x,
      y: y - pin.y
    });
    setIsDragging(true);
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !dragPin) return;
    
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;
      
      onUpdatePin(dragPin.id, { x, y });
    }
  }, [isDragging, dragPin, dragOffset, onUpdatePin]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragPin(null);
  }, []);

  const handleMouseMoveOnBoard = (e) => {
    if (!boardRef.current) return;
    
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onCursorMove(x, y);
  };

  // Add/remove global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={boardRef}
      className="relative flex-1 bg-gray-50 overflow-auto cursor-default"
      onDoubleClick={handleDoubleClick}
      onMouseMove={handleMouseMoveOnBoard}
    >
      {/* Dotted background grid */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#ffffff",
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.2) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Pins */}
      {pins.map(pin => (
        <Pin
          key={pin.id}
          pin={pin}
          currentUser={currentUser}
          onMouseDown={(e) => handleMouseDown(e, pin)}
          onUpdate={onUpdatePin}
          onDelete={onDeletePin}
          isCurrentUserOwner={pin.created_by === currentUser?.id}
        />
      ))}
      {/* Cursors of other users */}
      {otherUsers.map(user => (
        user.cursor && (
          <div
            key={user.id}
            className={styles.userCursor}
            style={{
              left: `${user.cursor.x}px`,
              top: `${user.cursor.y}px`,
              backgroundColor: user.color
            }}
          >
            <span className={styles.cursorName} style={{ color: user.color }}>
              {user.username}
            </span>
          </div>
        )
      ))}
    </div>
  );
}