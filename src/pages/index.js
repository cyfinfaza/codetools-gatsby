import * as React from "react"

import Layout from "../components/layout"

import * as pageStyle from "./index.module.css"

const IndexPage = () => (
  <Layout disableTopPadding transparentHeader>
    <div className={pageStyle.coveringContent}>
      <div>
        <h1>Write, practice, test, easy.</h1>
        <h2>The coding platform for APCS students and teachers.</h2>
      </div>
    </div>
    <div className={pageStyle.backgroundImage}>
      <div />
    </div>
  </Layout>
)

export default IndexPage
