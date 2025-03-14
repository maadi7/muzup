const ActionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  isOwner: boolean;
}> = ({ isOpen, onClose, onDelete, onReport, isOwner }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-80 overflow-hidden">
        {isOwner ? (
          <>
            <button
              onClick={onDelete}
              className="w-full p-4 text-red-500 hover:bg-gray-100 text-left"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="w-full p-4 text-gray-700 hover:bg-gray-100 text-left border-t"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onReport}
              className="w-full p-4 text-red-500 hover:bg-gray-100 text-left"
            >
              Report
            </button>
            <button
              onClick={onClose}
              className="w-full p-4 text-gray-700 hover:bg-gray-100 text-left border-t"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ActionModal;
