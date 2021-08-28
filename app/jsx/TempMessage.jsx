import React, { useEffect, useRef, useState } from "react";
import { useTimeoutFn } from "react-use";

export default function TempMessage({ timeout = 5000, message, setMessage }) {
  const [styleCloseButton, setStyleCloseButton] = useState({
    position: "inherit",
  });
  const ref = useRef();
  const closeButton = (
    <a
      href="#"
      title="close"
      className="close"
      aria-label="Close"
      aria-hidden="true"
    >
      &times;
    </a>
  );

  const [timeoutReady, timeoutCancel, timeoutReset] = useTimeoutFn(
    fadeOut,
    timeout
  );

  function fadeOut() {
    $(ref.current).fadeOut(() => {
      if (message) {
        setMessage("");
      }
    });
  }

  useEffect(() => {
    timeoutReset();
    if (message) {
      $(ref.current).fadeIn();
    }
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <div ref={ref} role="alert">
      {closeButton}
      <p className="alert alert-warning" style={styleCloseButton}>
        {message}
      </p>
    </div>
  );
}
