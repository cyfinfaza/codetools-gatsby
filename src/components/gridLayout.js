import React from "react"

import * as componentStyle from "./gridLayout.module.css"

export const GridLayout = ({ tabName, children }) => {
  return <div className={componentStyle.gridLayout}>{children}</div>
}

export const GridLayoutItem = props => {
  console.log(props)
  return <div {...props} className={props.clickable ? componentStyle.gridCard + " " + componentStyle.clickable : componentStyle.gridCard} />
}
