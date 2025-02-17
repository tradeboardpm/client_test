"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

const TimePicker = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const dropdownRef = useRef(null);

  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  // Generate minutes (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':');
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeSelect = (hour, minute) => {
    const newTime = `${hour}:${minute}`;
    onChange(newTime);
  };

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center w-full px-3 py-2 text-left border rounded-md hover:bg-accent ${
          !value ? 'text-gray-500' : 'text-foreground'
        } ${className}`}
      >
        <Clock className="w-4 h-4 mr-2" />
        {value || 'Select time'}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-48 mt-1 bg-popover border rounded-md shadow-lg">
          <div className="flex h-60 space-x-2 p-2">
            {/* Hours */}
            <div className="flex-1 border rounded-md">
              <div className="px-2 py-1.5 text-sm font-medium text-gray-500 text-center border-b">
                Hrs
              </div>
              <div className="h-48 overflow-y-auto custom-scrollbar">
                <div className="p-2">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      className={`w-full px-2 py-1 mb-1 text-sm rounded-md ${
                        selectedHour === hour
                          ? 'bg-primary hover:bg-accent'
                          : 'hover:bg-secondary'
                      }`}
                      onClick={() => {
                        setSelectedHour(hour);
                        handleTimeSelect(hour, selectedMinute || '00');
                      }}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Minutes */}
            <div className="flex-1 border rounded-md">
              <div className="px-2 py-1.5 text-sm font-medium text-gray-500 text-center border-b">
                Mins
              </div>
              <div className="h-48 overflow-y-auto custom-scrollbar">
                <div className="p-2">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      className={`w-full px-2 py-1 mb-1 text-sm rounded-md ${
                        selectedMinute === minute
                          ? 'bg-primary hover:bg-accent'
                          : 'hover:bg-secondary'
                      }`}
                      onClick={() => {
                        setSelectedMinute(minute);
                        handleTimeSelect(selectedHour || '00', minute);
                      }}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f7fafc;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f7fafc;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #a0aec0;
        }
      `}</style>
    </div>
  );
};

export default TimePicker;