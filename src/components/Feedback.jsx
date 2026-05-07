import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

export default function Feedback({ msg, type }) {
  const isError = type === 'error';
  const toastRef = useRef(null);
  
  useEffect(() => {
    anime({
      targets: toastRef.current,
      translateY: [50, 0],
      opacity: [0, 1],
      easing: 'easeOutElastic(1, .6)',
      duration: 1000
    });
  }, [msg]);
  
  return (
    <div ref={toastRef} className={`feedback-toast ${isError ? 'error' : 'success'}`}>
      <div className="feedback-content">
        <span className="feedback-icon">{isError ? '⚠️' : '✨'}</span>
        <span className="feedback-msg">{msg}</span>
      </div>
    </div>
  );
}

