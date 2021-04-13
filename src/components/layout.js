import React from "react"
import Header from "./header"
import * as layoutStyle from "./layout.module.css"

const Layout = ({ pageName, children, disableTopPadding = false }) => (
  <>
    <Header pageName={pageName} />
    <div className={layoutStyle.contentContainer} style={disableTopPadding ? { paddingTop: 0 } : {}}>
      {children}
    </div>
  </>
)

export default Layout
