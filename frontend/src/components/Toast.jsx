import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform";
    
    if (type === 'success') {
      return `${baseStyles} bg-green-500 text-white ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`;
    } else if (type === 'error') {
      return `${baseStyles} bg-red-500 text-white ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`;
    }
    
    return `${baseStyles} bg-blue-500 text-white ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`;
  };

  const getIcon = () => {
    if (type === 'success') {
      return <CheckCircle size={20} />;
    } else if (type === 'error') {
      return <XCircle size={20} />;
    }
    return null;
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <span className="font-medium">{message}</span>
      <button
        onClick={handleClose}
        className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast; 