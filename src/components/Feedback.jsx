import React from 'react';

export default function Feedback({ msg, type }) {
  const isError = type === 'error';
  
  return (
    <div className={`feedback-toast glass-panel ${isError ? 'error' : 'success'}`}>
      <div className="feedback-content">
        <span className="feedback-icon">{isError ? '⚠️' : '✨'}</span>
        <span className="feedback-msg">{msg}</span>
      </div>
      <div className="feedback-progress-bar"></div>
    </div>
  );
}
