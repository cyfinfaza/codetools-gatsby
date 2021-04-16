import { graphql } from "gatsby"
import React from "react"
import { useState, useEffect } from "react"
import Layout from "../components/layout"
import LoadingRing from "../components/loadingring"
import moment from "moment"

import * as pageStyle from "./mystuff.module.css"
import { func } from "prop-types"

const tabNamePairs = {
  editor_standalone: "Standalone Editors",
  editor_challenge: "Attempted Challenges",
  challenge: "My Challenges",
}

var disableGo = false

const MyStuff = ({ data }) => {
  const [pageContent, setPageContent] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const api = process.env.GATSBY_API_URL
  async function loadPageContent() {
    let myContentRequest = await (await fetch(api + "/myContent", { credentials: "include" })).json()
    console.log(myContentRequest)
    if (myContentRequest.status == "error") {
      window.location = "/signin"
    } else {
      console.log(myContentRequest.data)
      setPageContent(myContentRequest.data)
    }
  }
  useEffect(loadPageContent, [])
  const [currentTab, setCurrentTab] = useState("editor_standalone")
  const Tab = ({ tabName }) => (
    <span
      className={pageStyle.tab}
      onClick={() => {
        setCurrentTab(tabName)
      }}
      style={{ opacity: currentTab == tabName ? null : 0.3 }}
    >
      {tabNamePairs[tabName]}
    </span>
  )
  const ContentList = ({ tabName }) => {
    const [newLoading, setNewLoading] = useState(false)
    async function loadNew() {
      setNewLoading(true)
      var response = await (await fetch(api + "/new/" + tabName, { credentials: "include" })).json()
      console.log(response)
      window.location = "/editor/?id=" + response.data.linkID
    }
    async function deleteContent(id) {
      setLoading(true)
      var response = await (await fetch(api + "/delete/" + id, { credentials: "include" })).json()
      console.log(response)
      await loadPageContent()
      setLoading(false)
    }
    return (
      currentTab == tabName && (
        <div className={pageStyle.gridLayout}>
          {tabName != "editor_challenge" && pageContent != undefined && (
            <div className={pageStyle.gridCard} onClick={loadNew} key="%createnew">
              <span style={{ textAlign: "right", marginBottom: 0 }}>
                <i className="material-icons" style={{ fontSize: "64px" }}>
                  add
                </i>
              </span>
              <h1 className="horizPanel">
                <LoadingRing size="1em" active={newLoading} />
                <span style={{ marginLeft: newLoading ? "16px" : null }}>Create</span>
              </h1>
            </div>
          )}
          {pageContent &&
            pageContent
              .filter(content => content.type == tabName)
              .map((content, index) => (
                <div
                  key={content["_id"]}
                  className={pageStyle.gridCard}
                  onClick={() => {
                    if (!disableGo) window.location = "/editor/?id=" + content.linkID
                  }}
                  style={{ animationDelay: disableGo ? null : (index + (tabName != "editor_challenge" ? 0 : 1)) * 0.05 + "s", animationName: disableGo ? "none" : null }}
                >
                  <p style={{ textAlign: "right" }}>
                    {moment.unix(content.modified).fromNow()}
                    <br />
                    <button
                      style={{ marginTop: "8px", background: "#F00B" }}
                      onClick={() => deleteContent(content["_id"])}
                      onMouseOver={() => {
                        disableGo = true
                      }}
                      onMouseOut={() => {
                        disableGo = false
                      }}
                    >
                      Delete
                    </button>
                  </p>
                  <div>
                    {content.linkID && <code>{content.linkID}</code>}
                    {content.title && <h2 style={{ marginTop: "8px" }}>{content.title}</h2>}
                  </div>
                </div>
              ))}
        </div>
      )
    )
  }
  return (
    <Layout pageName="My Stuff" applyPadding="16px" disableFixedToScreenWidth>
      <h1 className="horizPanel" style={{ marginTop: 0 }}>
        <LoadingRing size="1em" active={loading} />
        <span style={{ marginLeft: loading ? "16px" : null }}></span>
        <Tab tabName="editor_standalone" />
        <Tab tabName="challenge" />
        <Tab tabName="editor_challenge" />
      </h1>
      <ContentList tabName="editor_standalone" />
      <ContentList tabName="editor_challenge" />
      <ContentList tabName="challenge" />
    </Layout>
  )
}

export const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`

export default MyStuff
