import React from "react"

import * as componentStyle from "./modalContainer.module.css"

const ModalContainer = ({ children, globalCloseCallback = null }) => {
  console.log(children)
  var openModal = false
  children.forEach(element => {
    openModal = openModal || element.props.open
  })
  return (
    <div className={componentStyle.modalContainer} style={!openModal ? { pointerEvents: "none" } : { backgroundColor: "#8884" }}>
      {children.map(child => {
        if (!child.props.onClose) return { ...child, props: { ...child.props, onClose: globalCloseCallback } }
        return child
      })}
    </div>
  )
}

export default ModalContainer
