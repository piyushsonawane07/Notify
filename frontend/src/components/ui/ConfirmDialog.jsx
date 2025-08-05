// frontend/src/components/ui/ConfirmDialog.jsx
'use client';

import React from 'react';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Delete', cancelLabel = 'Cancel', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-80 p-6 relative animate-pop-in">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        {description && <div className="mb-4 text-gray-600">{description}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
