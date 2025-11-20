'use client'
import React, { Fragment, useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

const DeleteFormDialog = ({ formId, formTitle, deleteForm }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dialogRef = useRef(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Handle clicking outside the modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 sm:gap-2 text-red-400 hover:text-red-300 transition-colors text-sm"
      >
        <Trash2 size={14} className="sm:size-[16px]" />
        <span>Delete</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            ref={dialogRef}
            className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <div className="mb-6">
              <h3
                id="dialog-title"
                className="text-lg font-medium leading-6 text-white mb-2"
              >
                Delete Form
              </h3>
              <p className="text-sm text-gray-400">
                Are you sure you want to delete "{formTitle}"? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
              >
                Cancel
              </button>
              <form action={deleteForm.bind(null, formId)}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteFormDialog;