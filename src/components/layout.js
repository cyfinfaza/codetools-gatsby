import React from "react"
import Header from "./header"
import * as layoutStyle from "./layout.module.css"

const Layout = ({
  pageName,
  children,
  disableTopPadding = false,
  applyPadding = 0,
  disableFixedToScreenHeight = false,
  transparentHeader = false,
}) => {
  const paddingCalc = applyPadding == 0 ? null : applyPadding
  return (
    <>
      <Header transparent={transparentHeader} pageName={pageName} />
      <div
        className={layoutStyle.contentContainer}
        style={{
          paddingTop: disableTopPadding ? 0 : null,
          paddingLeft: paddingCalc,
          paddingRight: paddingCalc,
          paddingBottom: paddingCalc,
          height: disableFixedToScreenHeight ? "unset" : null,
        }}
      >
        {children}
      </div>
    </>
  )
}

export default Layout
