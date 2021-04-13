import React from "react"

import Layout from "../components/layout"
import LoadingRing from "../components/loadingring"

const TestPage = () => {
  return (
    <Layout pageName="Test Page">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        <h1>Loading... </h1> <LoadingRing size="48px" active />
      </div>
    </Layout>
  )
}

export default TestPage
