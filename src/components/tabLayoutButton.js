import React from "react"

export default function TabLayoutButton({ name, compareKey, changeKeyMethod, keyName }) {
  let classNames = "clickfancy"
  if (keyName == compareKey) classNames += " tab_clicked"
  return (
    <div className={classNames} onClick={() => changeKeyMethod(keyName)}>
      {name}
    </div>
  )
}
