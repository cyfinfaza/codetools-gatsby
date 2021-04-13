import React from "react"
import { useEffect, useRef, Children } from "react"
import * as componentStyle from "./modal.module.css"

const Modal = ({ children, onClose, open, title, noCloseButton = false }) => {
  function checkEsc(event) {
    // console.log(event)
  }
  return (
    <div onKeyDown={checkEsc} className={componentStyle.modal} style={open ? { opacity: 1, transform: "none", pointerEvents: "all" } : { opacity: 0, transform: "scale(0.8)", pointerEvents: "none" }}>
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      {children}
      {!noCloseButton && (
        <button
          className="hoverfancy"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "48px",
            height: "48px",
            display: "flex",
            WebkitAlignItems: "center",
            WebkitBoxAlign: "center",
            msFlexAlign: "center",
            alignItems: "center",
            WebkitBoxPack: "center",
            WebkitJustifyContent: "center",
            msFlexPack: "center",
            justifyContent: "center",
          }}
          onClick={onClose}
        >
          <i className="material-icons" style={{ color: "white" }}>
            close
          </i>
        </button>
      )}
    </div>
  )
}

export default Modal
