import React from "react"

import * as componentStyle from "./modalContainer.module.css"

const ModalContainer = ({ children, globalCloseCallback = null }) => {
  // console.log(children)
  var openModal = false
  var fullObscure = false
  var noObscure = false
  var noAnimate = false
  children.forEach(element => {
    openModal = openModal || element.props.open
    fullObscure = element.props.open && element.props.fullObscure
    noObscure = element.props.open && element.props.noObscure
    noAnimate = element.props.open && element.props.noAnimate
  })
  return (
    <div
      className={componentStyle.modalContainer}
      style={{
        pointerEvents: !openModal ? "none" : null,
        backgroundColor: openModal ? (noObscure ? "none" : fullObscure ? "#222222" : "#88888844") : null,
        transition: noAnimate ? "none" : null,
      }}
    >
      {children.map(child => {
        if (!child.props.onClose) return { ...child, props: { ...child.props, onClose: globalCloseCallback } }
        return child
      })}
    </div>
  )
}

export default ModalContainer
