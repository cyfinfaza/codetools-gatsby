import React from "react"
import { useState, useEffect } from "react"
import SyntaxHighlighter from "react-syntax-highlighter"
import { sunburst } from "react-syntax-highlighter/dist/esm/styles/hljs"

import Layout from "../components/layout"
import Modal from "../components/Modal"
import ModalContainer from "../components/modalContainer"
import { GridLayout, GridLayoutItem } from "../components/gridLayout"

var linkID

const ResponsesPage = () => {
  const [pageContent, setPageContent] = useState(null)
  const [fetchError, setFetchError] = useState("Unknown Error")
  const [openModal, setOpenModal] = useState(null)
  const api = process.env.GATSBY_API_URL
  useEffect(async function () {
    var params = new URLSearchParams(window.location.search)
    const linkID = params.get("id")
    if (!linkID) {
      setFetchError("ID not found in URL.")
      setOpenModal("fetchError")
    }
    let linkIdFetchResult = await (
      await fetch(api + "/getContentFromLinkID/" + linkID, { credentials: "include" }).catch(() => {
        setFetchError("Could not connect to the server.")
        setOpenModal("fetchError")
      })
    ).json()
    console.log(linkIdFetchResult)
    if (linkIdFetchResult.status == "error") {
      if (linkIdFetchResult.errorCode == "api_general_session") {
        localStorage.setItem("intent", window.location.href)
        window.location = "/signin"
      } else {
        setOpenModal("fetchError")
        setFetchError(linkIdFetchResult.error)
      }
      return
    }
    var challengeResults = await (
      await fetch(api + "/challengeresults/" + linkIdFetchResult.data["_id"], { credentials: "include" }).catch(() => {
        setFetchError("Could not connect to the server.")
        setOpenModal("fetchError")
      })
    ).json()
    console.log(challengeResults)
    if (challengeResults.status == "error") {
      setOpenModal("fetchError")
      setFetchError(linkIdFetchResult.error)
      return
    }
    setPageContent(challengeResults.data)
  }, [])
  const [nowViewing, setNowViewing] = useState({ owner: "", code: "", args_immutable: [] })
  return (
    <Layout pageName="Responses" applyPadding="16px" disableFixedToScreenHeight>
      <ModalContainer globalCloseCallback={() => setOpenModal(null)}>
        <Modal title="Fetch Error" open={openModal == "fetchError"}>
          <p>{fetchError}</p>
        </Modal>
        <Modal title="some modal">
          <p>something</p>
        </Modal>
        <Modal title="View Response" open={openModal == "responseViewer"}>
          <h2>{nowViewing.owner.actualname + "'s Response"}</h2>
          <div className="horizPanel" style={{ width: "100%", height: "300px", argin: "0", boxSizing: "border-box" }}>
            <pre style={{ flex: "1", height: "100%", overflow: "auto", margin: "0", boxSizing: "border-box" }}>
              <code>{nowViewing.code}</code>
            </pre>
            <div>
              <p>something</p>
              <p>something</p>
              <p>something</p>
              <p>something</p>
            </div>
          </div>
        </Modal>
      </ModalContainer>
      <GridLayout>
        {pageContent &&
          pageContent.map(response => {
            var score = 0
            var total = 0
            response.args_immutable.forEach(element => {
              total++
              if (element.match) score++
            })
            return (
              <GridLayoutItem
                clickable
                // onClick={() => {
                //   setNowViewing(response)
                //   setOpenModal("responseViewer")
                // }}
                onClick={() => {
                  window.location = "/editor/?viewID=" + response["_id"]
                }}
              >
                <div>
                  <h2 style={{ marginBottom: "4px" }}>{response.owner.actualname}</h2>
                  <code>@{response.owner.username}</code>
                </div>
                <pre style={{ overflow: "hidden", textOverflow: "ellipsis", flex: "1", marginBlock: "8px", background: "none" }}>
                  <code>
                    {/* <SyntaxHighlighter language="java" style={sunburst}> */}
                    {response.code}
                    {/* </SyntaxHighlighter> */}
                  </code>
                </pre>
                <div style={{ textAlign: "right" }}>
                  <h2>
                    {score}/{total}
                  </h2>
                </div>
              </GridLayoutItem>
            )
          })}
      </GridLayout>
    </Layout>
  )
}

export default ResponsesPage
