import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();
  return (
    <div>
      <h1>404 - Not Found!</h1>
      <h2>{location.pathname}</h2>
      <Link to="/">Home</Link>
    </div>
  );
}
