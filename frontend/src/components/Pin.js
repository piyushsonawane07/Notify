'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from './ui/dialog';


export default function Pin({ pin, currentUser, onMouseDown, onUpdate, onDelete, isCurrentUserOwner }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(pin.text);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(0, textareaRef.current.value.length);
    }
  }, [isEditing]);

  // Sync local text state with prop for real-time updates
  useEffect(() => {
    setText(pin.text);
  }, [pin.text]);

  const handleTextClick = (e) => {
    e.stopPropagation();
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (text.trim() && text !== pin.text) {
      onUpdate(pin.id, { text });
    } else {
      setText(pin.text);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textareaRef.current.blur();
    } else if (e.key === 'Escape') {
      setText(pin.text);
      setIsEditing(false);
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };
  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onDelete(pin.id);
  };

  return (
    <div
      className="absolute w-[200px] h-[200px] bg-white shadow-2xl overflow-hidden cursor-move select-none"
      style={{
        left: `${pin.x}px`,
        top: `${pin.y}px`,
        background: '#ffe082', // pastel yellow
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
      }}
      onMouseDown={onMouseDown}
    >
      <div className="cursor-move w-full h-2" style={{ backgroundColor: pin.color }}>
        <button className="absolute rounded-full top-1 right-1 bg-black/50 text-white w-5 h-5  flex items-center justify-center cursor-pointer text-base opacity-0 hover:opacity-100 transition-opacity" onClick={handleDelete}>
         x
        </button>
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Note?</DialogTitle>
            </DialogHeader>
            <div className="mb-4 text-gray-600">Are you sure you want to delete this note? This action cannot be undone.</div>
            <DialogFooter>
              <DialogClose asChild>
                <button className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </button>
              </DialogClose>
              <button className="px-4 py-2 rounded text-white bg-red-600 font-semibold" onClick={handleConfirmDelete}>
                Delete
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="text-gray-700 p-3 min-h-[150px]" onClick={handleTextClick}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[170px] border border-blue-400/40  rounded p-2 font-inherit resize-none outline-none"
            placeholder="Type your note here..."
          />
        ) : (
          <div className="whitespace-pre-wrap break-words">{text || 'Empty note'}</div>
        )}
      </div>
    </div>
  );
}