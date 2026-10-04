import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  isDestructive = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className={isDestructive ? 'text-[#ff3e1d]' : 'text-[#ffab00]'} />
            <h3 className="font-bold text-[#566a7f] text-lg">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-[#a1acb8] hover:text-[#ff3e1d] transition-colors p-1">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-[#697a8d]">{message}</p>
        </div>
        
        <div className="flex justify-end gap-3 p-4 bg-[#f9f9fa] border-t border-gray-100">
          <button 
            onClick={onCancel}
            className="px-4 py-2 font-semibold text-[#697a8d] bg-white border border-[#d9dee3] rounded-lg hover:bg-[#f8f9fa] transition-colors shadow-sm"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-2 font-semibold text-white rounded-lg shadow-sm transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] ${isDestructive ? 'bg-[#ff3e1d] hover:bg-[#e6381a] shadow-[0_2px_4px_rgba(255,62,29,0.3)]' : 'bg-[#696cff] hover:bg-[#5f61e6] shadow-[0_2px_4px_rgba(105,108,255,0.3)]'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
