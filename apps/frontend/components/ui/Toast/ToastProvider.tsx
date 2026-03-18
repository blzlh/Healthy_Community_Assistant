"use client";

import { ToastContainer } from "react-toastify";

export function ToastProvider() {
  return <ToastContainer newestOnTop={false} closeButton={false} />
}
