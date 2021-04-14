import React from "react"
import Header from "./header"
import * as layoutStyle from "./layout.module.css"

const Layout = ({ pageName, children, disableTopPadding = false, applyPadding = 0 }) => {
  const paddingCalc = applyPadding == 0 ? null : applyPadding
  return (
    <>
      <Header pageName={pageName} />
      <div className={layoutStyle.contentContainer} style={{ paddingTop: disableTopPadding ? 0 : null, paddingLeft: paddingCalc, paddingRight: paddingCalc, paddingBottom: paddingCalc }}>
        {children}
      </div>
    </>
  )
}

export default Layout
