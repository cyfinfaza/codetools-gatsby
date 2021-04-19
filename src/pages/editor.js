import React from "react"
import { graphql } from "gatsby"
import { useState, useEffect, useRef } from "react"
import Modal from "../components/Modal"
import LoadingScreen from "../components/editor/LoadingScreen"
import TabLayoutButton from "../components/tabLayoutButton"
import Editor from "@monaco-editor/react"
import RunArg from "../components/editor/RunArg"
import ReadonlyRunArg from "../components/editor/ReadonlyRunArg"
import "../components/editor/editorstyle.css"
import ReactMarkdown from "react-markdown"

import Layout from "../components/layout"
import LoadingRing from "../components/loadingring"
import ModalContainer from "../components/modalContainer"

let uploadInstanceCount = 1
let globalUploadFlag = false
let theUploaderHasGotThis = false
let codeOnServer
let metadataOnServer
let argsOnServer
let uploadBody
const keyLang = {
  code: "java",
  starterCode: "java",
  description: "markdown",
}
const keyOpt = {
  code: { wordWrap: "off" },
  starterCode: { wordWrap: "off" },
  description: { wordWrap: "on" },
}
var ecws
var id_sig

function makeid(length) {
  var result = ""
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

var editorType
var contentID

const EditorPage = ({ data }) => {
  const api = process.env.GATSBY_API_URL
  const [linkIdData, setLinkIdData] = useState(null)
  const [metadata, setMetadata] = useState({
    title: null,
    timeout: null,
  })
  const [currentCompilerError, setCurrentCompilerError] = useState(null)
  const [challengeComplete, setChallengeComplete] = useState(false)
  const [uploadFlag, setUploadFlag] = useState(false)
  const [fetchError, setFetchError] = useState("Unknown error.")
  // const [openModal, setOpenModal] = useState(null);
  const [openModal, setOpenModal] = useState("contentLoading")
  // window.setOpenModal = setOpenModal
  const [openCodeKey, setOpenCodeKey] = useState(null)
  const [currentCodeText, setCurrentCodeText] = useState(null)
  const [code, setCode] = useState({
    code: null,
    starterCode: null,
    description: null,
  })
  const [args, setArgs] = useState([])
  const args_ref = useRef()
  args_ref.current = args
  const [args_immutable, setArgs_immutable] = useState([])
  const args_immutable_ref = useRef()
  args_immutable_ref.current = args_immutable
  const [runStatus, setRunStatus] = useState({ icon: "info", text: "Connecting to ECWS", style: "fancybutton_warn", enabled: false })
  let codeForEditor = code[openCodeKey]
  const [pageLinkID, setPageLinkID] = useState(null)
  useEffect(async function () {
    try {
      var params = new URLSearchParams(window.location.search)
      const linkID = params.get("id")
      setPageLinkID(linkID)
      setLinkIdData(linkID)
      let linkIdFetchResult = await (
        await fetch(api + "/getContentFromLinkID/" + linkID, { credentials: "include" }).catch(() => setLinkIdData("Failed to connect to server."))
      ).json()
      console.log(linkIdFetchResult)
      setLinkIdData(linkIdFetchResult)
      if (linkIdFetchResult.status == "error") {
        if (linkIdFetchResult.errorCode == "api_general_session") {
          localStorage.setItem("intent", window.location.href)
          window.location = "/signin"
        } else {
          setOpenModal("notFoundError")
          setFetchError(linkIdFetchResult.error)
        }
        return
      } else {
        editorType = linkIdFetchResult.data.type
      }
      console.log(editorType)
      contentID = linkIdFetchResult.data["_id"]
      await fetch(api + "/contentget?id=" + contentID, { credentials: "include" })
        .then(response => response.json())
        .then(async function (data) {
          console.log(data)
          if (data.status == "error") {
            setOpenModal("fatalError")
            console.error(data)
            return
          }
          data = data.data
          var metadataToSet = {}
          var codeToSet = {}
          codeToSet.code = data.code
          id_sig = data.id_sig
          setArgs(
            data.args_mutable.map(server_arg => {
              return { id: server_arg.id, text: server_arg.arg, output: "No Output" }
            })
          )
          codeToSet.description = data.description
          if (editorType == "editor_standalone" || editorType == "challenge") {
            metadataToSet.title = data.title
          }
          if (editorType == "challenge") {
            codeToSet.starterCode = data.starterCode
          }
          if (data.timeout) metadataToSet.timeout = data.timeout
          if (editorType == "editor_challenge") {
            await fetch(api + "/contentget?id=" + data.assocChallenge, { credentials: "include" })
              .then(response => response.json())
              .then(assocData => {
                // console.log(assocData)
                assocData = assocData.data
                metadataToSet.title = assocData.title
                // codeToSet.description = assocData.description
              })
            setArgs_immutable(
              data.args_immutable.map(server_arg => {
                return { id: server_arg.id, text: server_arg.arg, output: "No Output" }
              })
            )
          }
          setCode(codeToSet)
          codeOnServer = { ...codeToSet }
          setMetadata(metadataToSet)
          metadataOnServer = { ...metadataToSet }
          setInterval(checkAndSave, 10000)
          setOpenModal(null)
          document.getElementById("header").style.display = "flex"
          setOpenCodeKey("code")
        })
        .catch(e => {
          console.error(e)
          setOpenModal("fatalError")
        })
      ecws = new WebSocket(process.env.GATSBY_ECWS_URL + "/ecws/runcode")
      ecws.addEventListener("open", () => {
        setRunStatus({ icon: "play_arrow", text: "Run Code", style: "", enabled: true })
      })
      ecws.addEventListener("message", event => {
        let data = JSON.parse(event.data)
        let output = ""
        if (data.type === "statusUpdate") setRunStatus({ icon: "hourglass_full", text: data.status, style: "fancybutton_half", enabled: true })
        else if (data.type === "error") setRunStatus({ icon: "error", text: data.error, style: "fancybutton_error", enabled: true })
        else if (data.type === "jobComplete") {
          if (data.run === "compilerError") {
            setRunStatus({ icon: "error_outline", text: "Tests did not run", style: "fancybutton_warn", enabled: true })
            setCurrentCompilerError(data.error)
            return
          }
          setCurrentCompilerError(null)
          setRunStatus({ icon: "check_circle", text: "Tests Complete", style: "fancybutton_on", enabled: true })
          // console.log(args_ref.current);
          setArgs(
            args_ref.current.map(existingArg => {
              let thisResult = data.data.filter(runResult => runResult.id === existingArg.id)[0]
              if (thisResult) {
                return { ...existingArg, ...thisResult, match: editorType == "editor_challenge" ? null : true }
              }
              // console.log(existingArg);
              return existingArg
            })
          )
          var completionCheck = true
          setArgs_immutable(
            args_immutable_ref.current.map(existingArg => {
              let thisResult = data.data.filter(runResult => runResult.id === existingArg.id)[0]
              if (thisResult) {
                completionCheck = completionCheck && thisResult.match
                return { ...existingArg, ...thisResult }
              }
              // console.log(existingArg);
              completionCheck = completionCheck && existingArg.match
              return existingArg
            })
          )
          setChallengeComplete(completionCheck)
        }
        // console.log(data);
        // console.log(runStatus);
      })
      ecws.addEventListener("close", event => {
        setRunStatus({ icon: "error", text: "ECWS Offline", style: "fancybutton_error", enabled: false })
      })
    } catch (error) {
      setOpenModal("fatalError")
    }
  }, [])
  useEffect(() => {
    let args_mutable = args.map(arg => {
      return { id: arg.id, arg: arg.text }
    })
    let toSend = { contentID: contentID, ...code, ...metadata, args_mutable: args_mutable }
    for (var propName in toSend) if (toSend[propName] === null || toSend[propName] === undefined) delete toSend[propName]
    uploadBody = toSend
    setUploadFlag(true)
    theUploaderHasGotThis = false
    // console.log(theUploaderHasGotThis);
  }, [code, metadata, args])
  useEffect(() => {
    globalUploadFlag = uploadFlag
  }, [uploadFlag])
  useEffect(() => {
    console.info("ECWS Run: " + runStatus.text)
  }, [runStatus])
  async function checkAndSave() {
    // console.log(globalUploadFlag);
    if (uploadInstanceCount == 1 && globalUploadFlag) {
      uploadInstanceCount += 1
      theUploaderHasGotThis = true
      // console.log(theUploaderHasGotThis);
      await fetch(api + "/contentset", {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadBody),
      })
        .then(response => response.json())
        .then(data => {
          // console.log(data);
          uploadInstanceCount = 1
          // console.log("needs to be saved");
        })
      // console.log(theUploaderHasGotThis);
      if (theUploaderHasGotThis) setUploadFlag(false)
    }
  }
  function handleEditorChange(e) {
    var oldCode = { ...code }
    oldCode[openCodeKey] = e
    setCode(oldCode)
  }
  function deleteArg(argID) {
    let oldArgs = args.filter(function (item) {
      return item.id !== argID
    })
    setArgs(oldArgs)
  }
  function changeArg(e, id) {
    let argsWillBe = args.map(arg => {
      if (arg.id == id) arg.text = e.target.value
      return arg
    })
    setArgs(argsWillBe)
  }
  function newArg() {
    let oldArgs = [...args]
    oldArgs.push({ id: makeid(10), output: "No Output", text: "" })
    setArgs(oldArgs)
  }
  async function runCode() {
    setRunStatus({ icon: "hourglass_full", text: "Saving...", style: "fancybutton_half", enabled: false })
    await checkAndSave()
    setRunStatus({ icon: "hourglass_full", text: "Requesting...", style: "fancybutton_half", enabled: true })
    let auth
    await fetch(api + "/fetchsession", { credentials: "include" })
      .then(response => response.json())
      .then(data => (auth = data.data))
    console.log(auth)
    ecws.send(JSON.stringify({ contentID: contentID, id_sig: id_sig, auth: auth }))
  }
  const RepublishForm = () => {
    const [loading, setLoading] = useState(false)
    const [thingsToRepublish, setThingsToRepublish] = useState([])
    const [errorMsg, setErrorMsg] = useState(null)
    async function submit(event) {
      event.preventDefault()
      setErrorMsg(null)
      setLoading(true)
      await checkAndSave()
      let changeResult = await (
        await fetch(api + "/republish/" + contentID, { credentials: "include", method: "post", body: JSON.stringify(thingsToRepublish) }).catch(() =>
          setErrorMsg("Failed to connect to server.")
        )
      ).json()
      console.log(changeResult)
      if (changeResult.status == "error") {
        setErrorMsg(changeResult.error)
        setLoading(false)
      } else {
        setOpenModal(null)
      }
    }
    const SelectButton = ({ text, selected = false, onClick }) => (
      <span style={{ opacity: selected ? 1 : 0.5, marginRight: "8px", cursor: "pointer", userSelect: "none" }} onClick={onClick}>
        {text}
      </span>
    )
    function toggleThing(thing) {
      if (thingsToRepublish.includes(thing)) setThingsToRepublish(thingsToRepublish.filter(element => element != thing))
      else setThingsToRepublish([...thingsToRepublish, thing])
    }
    return (
      <>
        <form onSubmit={submit}>
          <p>Select what to republish:</p>
          <p>
            <SelectButton selected={thingsToRepublish.includes("description")} onClick={() => toggleThing("description")} text="Description" />
            <SelectButton selected={thingsToRepublish.includes("args")} onClick={() => toggleThing("args")} text="Tests" />
            <SelectButton selected={thingsToRepublish.includes("starterCode")} onClick={() => toggleThing("starterCode")} text="Starter Code" />
          </p>

          <div className="horizPanel">
            <button className="hoverfancy" style={{ width: "fit-content", marginTop: 8 }} type="submit">
              Republish
            </button>
            <LoadingRing size="24px" active={loading} />
          </div>
        </form>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </>
    )
  }
  return (
    <Layout pageName="Editor" disableTopPadding>
      <ModalContainer globalCloseCallback={() => setOpenModal(null)}>
        <Modal open={openModal == "changeTitle"} title="Change Title">
          <input
            onKeyDown={event => {
              if (event.keyCode == 13) setOpenModal(null)
            }}
            type="text"
            style={{
              width: "100%",
              boxSizing: "border-box",
              height: "32px",
            }}
            value={metadata.title ? metadata.title : ""}
            onChange={e => setMetadata({ ...metadata, title: e.target.value })}
            placeholder="New title"
          />
        </Modal>
        <Modal open={openModal == "editConfig"} title="Edit Config">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto",
              rowGap: "8px",
              alignItems: "center",
            }}
          >
            <label style={{ marginRight: "10px" }} htmlFor="timeout">
              Timeout:{" "}
            </label>
            <select value={metadata.timeout ? metadata.timeout : 5} onChange={e => setMetadata({ ...metadata, timeout: parseInt(e.target.value) })}>
              {(() => {
                var output = []
                for (var i = 1; i <= 15; i++) {
                  output.push(
                    <option key={i} value={i}>
                      {i + " seconds"}
                    </option>
                  )
                }
                return output
              })()}
            </select>
            <label style={{ marginRight: "10px" }} htmlFor="runMethod">
              Method to Run:{" "}
            </label>
            <input
              type="text"
              value={metadata.runMethod ? metadata.runMethod : "myMethod"}
              onChange={e => setMetadata({ ...metadata, runMethod: e.target.value })}
            >
              {/* {(() => {
                var output = []
                for (var i = 1; i <= 15; i++) {
                  output.push(
                    <option key={i} value={i}>
                      {i + " seconds"}
                    </option>
                  )
                }
                return output
              })()} */}
            </input>
          </div>
        </Modal>
        <Modal title="Publish &amp; Assess" open={openModal == "publishOptions"}>
          <div className="noTopMarginContent">
            <h2>Publish/Share</h2>
            <p>Share the URL of this page to let someone else solve the challenge.</p>
            <h2>See Responses</h2>
            <p>
              Visit the <a href={"/responses/?id=" + pageLinkID}>responses page</a>
            </p>
            <h2>Republish</h2>
            <p>If you have made changes since people clicked your link, you will need to republish for them to see those changes.</p>
            <RepublishForm />
          </div>
        </Modal>
        <LoadingScreen open={openModal == "contentLoading"} noObscure>
          <img src="/CodeToolsLogo.svg" style={{ width: "50%", marginBottom: 16 }}></img>
          <div className="loadingBar" style={{ width: "100%", height: 8 }}></div>
        </LoadingScreen>
        <Modal open={openModal == "fatalError"} title="Fatal Error" noCloseButton fullObscure>
          <p>An error has caused this editor to stop. Check the console for details. Reload the editor.</p>
        </Modal>
        <Modal open={openModal == "notFoundError"} title="Fetch Error" noCloseButton fullObscure noAnimate>
          <p>{fetchError}</p>
          {/* <p>There was an error fetching the content. Perhaps the URL is incorrect, or the content was deleted. </p> */}
          <p>
            <a href="/">Go Home</a>
          </p>
        </Modal>
      </ModalContainer>
      <div className="editor-main" style={openModal == null ? {} : { pointerEvents: "none", userSelect: "none" }}>
        <div id="descriptionSidebar" className="sidebar">
          <h1 id="contentTitle" style={{ marginBottom: "0" }}>
            {/* <ReactSafeHtml html={metadata.title == null ? "Loading..." : metadata.title} /> */}
            {metadata.title == null ? "Loading..." : metadata.title}
          </h1>
          {editorType != "editor_challenge" && (
            <button style={{ margin: "12px", marginLeft: "0" }} onClick={() => setOpenModal("changeTitle")}>
              Change Title
            </button>
          )}
          <p style={{ marginTop: "24px" }} id="contentDescription">
            {/* <ReactSafeHtml html={code.description == null ? "Loading..." : code.description} /> */}
            {code.description == null ? "Loading..." : <ReactMarkdown>{code.description}</ReactMarkdown>}
          </p>
        </div>
        <div className="threeCenter">
          {editorType == "editor_standalone" && (
            <div className="tabs">
              <TabLayoutButton name="Code" keyName="code" compareKey={openCodeKey} changeKeyMethod={setOpenCodeKey} />
              <TabLayoutButton name="Description" keyName="description" compareKey={openCodeKey} changeKeyMethod={setOpenCodeKey} />
            </div>
          )}
          {editorType == "challenge" && (
            <div className="tabs">
              <TabLayoutButton name="Solution" keyName="code" compareKey={openCodeKey} changeKeyMethod={setOpenCodeKey} />
              <TabLayoutButton name="Starter Code" keyName="starterCode" compareKey={openCodeKey} changeKeyMethod={setOpenCodeKey} />
              <TabLayoutButton name="Description" keyName="description" compareKey={openCodeKey} changeKeyMethod={setOpenCodeKey} />
            </div>
          )}
          {editorType == "editor_challenge" && (
            <div className="tabs">
              <TabLayoutButton name="Code" keyName="code" compareKey={openCodeKey} changeKeyMethod={setOpenCodeKey} />
            </div>
          )}
          <Editor
            id="monacoContainer"
            className="monacoContainer"
            defaultLanguage={keyLang[openCodeKey]}
            theme="vs-dark"
            options={{ minimap: { enabled: false }, ...keyOpt[openCodeKey], fontFamily: "DM Mono, monospace" }}
            value={codeForEditor}
            path={openCodeKey}
            // onMount={monacoMounted}
            onChange={handleEditorChange}
          />
        </div>
        <div id="argsSidebar" className="sidebar">
          <h1>{editorType == "challenge" ? "Prepare Tests" : "Run and Test"}</h1>
          <button
            id="runbutton"
            className={"fancybutton " + (runStatus.enabled ? "fancybutton_enabled " : "") + runStatus.style}
            style={{ width: "100%", margin: "0" }}
            // onmouseover="runButtonHovered()"
            onClick={runStatus.enabled ? runCode : null}
          >
            <i className="material-icons">{runStatus.icon}</i>
            <span>{runStatus.text}</span>
          </button>
          <div
            id="compilerError"
            style={{
              display: currentCompilerError ? "flex" : "none",
              flexDirection: "column",
              msFlexDirection: "column",
              flexDirection: "column",
              alignItems: "center",
              WebkitBoxAlign: "center",
              msFlexAlign: "center",
              alignItems: "center",
              color: "#F88",
            }}
          >
            <p
              style={{
                display: "flex",
                alignItems: "center",
                WebkitBoxAlign: "center",
                msFlexAlign: "center",
                alignItems: "center",
                marginBottom: "8px",
                justifyContent: "center",
              }}
            >
              <i className="material-icons" style={{ marginRight: "8px" }}>
                warning
              </i>{" "}
              Compiler Error
            </p>
            <p
              id="compilerErrorText"
              className="monofont"
              style={{
                margin: "0",
                fontSize: "12px",
                msFlexItemAlign: "flex-start",
                alignSelf: "flex-start",
              }}
            >
              {currentCompilerError}
            </p>
          </div>
          {editorType == "editor_challenge" && (
            <div
              id="challengeCompletedMessage"
              style={{
                display: challengeComplete ? "flex" : "none",
                flexDirection: "column",
                msFlexDirection: "column",
                flexDirection: "column",
                alignItems: "center",
                WebkitBoxAlign: "center",
                msFlexAlign: "center",
                alignItems: "center",
                color: "#8F8",
              }}
            >
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  WebkitBoxAlign: "center",
                  msFlexAlign: "center",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <i className="material-icons" style={{ marginRight: "8px" }}>
                  verified
                </i>{" "}
                Challenge Completed
              </p>
            </div>
          )}
          <div id="argslist" style={{ minHeight: "24px" }}>
            {args_immutable.map(arg => (
              <ReadonlyRunArg key={arg.id} arg={arg} />
            ))}
            {args.map(arg => (
              <RunArg key={arg.id} arg={arg} onChange={changeArg} onDelete={deleteArg} />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              msFlexDirection: "column",
              flexDirection: "column",
              alignItems: "center",
              WebkitBoxAlign: "center",
              msFlexAlign: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <button className="hoverfancy" onClick={newArg} style={{ paddingRight: "12px", marginTop: "12px" }}>
              <i className="material-icons">add</i> New Test
            </button>
            {editorType != "editor_challenge" && (
              <>
                <button
                  id="setConfiguration"
                  className="hoverfancy"
                  onClick={() => setOpenModal("publishOptions")}
                  style={{ paddingRight: "10px", marginTop: "12px" }}
                >
                  <i className="material-icons" style={{ marginRight: "4px", fontSize: "24px" }}>
                    share
                  </i>
                  Publish &amp; Assess
                </button>
                <button
                  id="setConfiguration"
                  className="hoverfancy"
                  onClick={() => setOpenModal("editConfig")}
                  style={{ paddingRight: "10px", marginTop: "12px" }}
                >
                  <i className="material-icons" style={{ marginRight: "4px", fontSize: "24px" }}>
                    tune
                  </i>
                  Config
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div id="uploadStatusDiv" className="uploadStatusDiv uploadStatusColored" style={{ backgroundColor: uploadFlag ? "#FD0" : "#0F0" }}>
        <i id="uploadStatusIcon" className="material-icons" style={{ marginRight: "4px" }}>
          {uploadFlag ? "sync" : "cloud_done"}
        </i>
        <span id="uploadStatusText">{uploadFlag ? "Saving..." : "Saved"}</span>
      </div>
      <div className="uploadStatusLine uploadStatusColored" style={{ backgroundColor: uploadFlag ? "#FD0" : "#0F0" }}>
        something
      </div>
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

export default EditorPage
