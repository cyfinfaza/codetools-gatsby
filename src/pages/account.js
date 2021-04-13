import { graphql } from "gatsby"
import React from "react"
import { useState, useEffect } from "react"
import moment from "moment"

import Layout from "../components/layout"
import LoadingRing from "../components/loadingring"
import Modal from "../components/Modal"
import ModalContainer from "../components/modalContainer"

const AccountPage = ({ data }) => {
  const [pageContent, setpageContent] = useState(null)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(false)
  const [openModal, setOpenModal] = useState(null)
  const api = data.site.siteMetadata.apiLocation
  async function loadAccountData() {
    // setSessionsLoading(true)
    let acctData = await (await fetch(api + "/accountdata", { credentials: "include" })).json()
    console.log(acctData)
    if (acctData.status == "error") {
      window.location = "/signin"
    } else {
      setpageContent(acctData.data)
    }
    setSessionsLoading(false)
    setUserLoading(false)
  }
  async function terminateSession(id) {
    setSessionsLoading(true)
    let killResult = await (await fetch(api + "/killsession/" + id, { credentials: "include" })).json()
    console.log(killResult)
    loadAccountData()
  }
  const ChangeActualNameForm = () => {
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)
    async function submit(event) {
      event.preventDefault()
      // setUserLoading(true)
      setLoading(true)
      var requestedName = event.target.querySelector("input[name='requestedName']").value
      console.log(requestedName)
      let changeResult = await (
        await fetch(api + "/changeactualname", { credentials: "include", method: "post", body: JSON.stringify({ newName: requestedName }) }).catch(() => setErrorMsg("Failed to connect to server."))
      ).json()
      console.log(changeResult)
      await loadAccountData()
      setOpenModal(null)
      setLoading(false)
    }
    return (
      <>
        <form onSubmit={submit}>
          <p>Change your actual name from {pageContent && pageContent.actualname} to:</p>
          <input type="text" placeholder="New name" name="requestedName" defaultValue={pageContent && pageContent.actualname} />
          <div className="horizPanel">
            <button className="hoverfancy" style={{ width: "fit-content", marginTop: 8 }} type="submit">
              Change
            </button>
            <LoadingRing size="24px" active={loading} />
          </div>
        </form>
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        {/* <LoadingRing size="36px" active={loading} /> */}
      </>
    )
  }
  const ChangePasswordForm = () => {
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)
    async function submit(event) {
      event.preventDefault()
      // setUserLoading(true)
      setErrorMsg(null)
      setLoading(true)
      var oldpass = event.target.querySelector("input[name='oldpass']").value
      var newpass = event.target.querySelector("input[name='newpass']").value
      let changeResult = await (
        await fetch(api + "/changepassword", { credentials: "include", method: "post", body: JSON.stringify({ oldpass: oldpass, newpass: newpass }) }).catch(() =>
          setErrorMsg("Failed to connect to server.")
        )
      ).json()
      console.log(changeResult)
      if (changeResult.status == "error") {
        setErrorMsg(changeResult.error)
      } else {
        await loadAccountData()
        setOpenModal(null)
      }
      setLoading(false)
    }
    return (
      <>
        <form onSubmit={submit}>
          <p>
            Change password for {pageContent && pageContent.username}. You will need to provide your previous password. Get in touch if you have forgotten your password, and you need to recover your
            account.
          </p>
          <input type="password" placeholder="Old password" name="oldpass" />
          <br />
          <input type="password" placeholder="New password" name="newpass" />
          <div className="horizPanel">
            <button className="hoverfancy" style={{ width: "fit-content", marginTop: 8 }} type="submit">
              Change
            </button>
            <LoadingRing size="24px" active={loading} />
          </div>
        </form>
        {/* <LoadingRing size="36px" active={loading} /> */}
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </>
    )
  }
  const DeleteAccountForm = () => {
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)
    async function submit(event) {
      event.preventDefault()
      // setUserLoading(true)
      setErrorMsg(null)
      setLoading(true)
      var password = event.target.querySelector("input[name='password']").value
      let changeResult = await (
        await fetch(api + "/deleteaccount", { credentials: "include", method: "post", body: JSON.stringify({ password: password }) }).catch(() => setErrorMsg("Failed to connect to server."))
      ).json()
      console.log(changeResult)
      if (changeResult.status == "error") {
        setErrorMsg(changeResult.error)
        setLoading(false)
      } else {
        window.location = "/"
      }
    }
    return (
      <>
        <form onSubmit={submit}>
          <p>Provide the password for the account: {pageContent && pageContent.username} in order to permanently delete the account.</p>
          <input type="password" placeholder="Password" name="password" />
          <div className="horizPanel">
            <button className="hoverfancy" style={{ width: "fit-content", marginTop: 8 }} type="submit">
              Delete Account
            </button>
            <LoadingRing size="24px" active={loading} />
          </div>
        </form>
        {/* <LoadingRing size="36px" active={loading} /> */}
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      </>
    )
  }
  useEffect(loadAccountData, [])
  return (
    <Layout pageName="My Account">
      <ModalContainer globalCloseCallback={() => setOpenModal(null)}>
        <Modal title="some title" open={openModal == "modal1"}>
          <p>some modal</p>
        </Modal>
        <Modal title="Change Password" open={openModal == "changePassword"}>
          <ChangePasswordForm />
        </Modal>
        <Modal title="Change Actual Name" open={openModal == "changeActualName"}>
          <ChangeActualNameForm />
        </Modal>
        <Modal title="Delete Account" open={openModal == "deleteAccount"}>
          <DeleteAccountForm />
        </Modal>
      </ModalContainer>
      {pageContent ? (
        <div style={{ marginLeft: 16, paddingBottom: 16, marginRight: 16 }}>
          <h1 className="horizPanel">
            <LoadingRing size="48px" active={userLoading} />{" "}
            <span style={{ marginLeft: userLoading ? "16px" : null }}>
              @{pageContent.username} <span style={{ fontWeight: "lighter", fontSize: "smaller" }}>aka </span> {pageContent.actualname}
            </span>
          </h1>
          <p>
            <button onClick={() => setOpenModal("changePassword")}>Change Password</button> <button onClick={() => setOpenModal("changeActualName")}>Change Actual Name</button>
          </p>
          <h1 className="horizPanel">
            <LoadingRing size="48px" active={sessionsLoading} />
            <span style={{ marginLeft: sessionsLoading ? "16px" : null }}>Active Sessions</span>
          </h1>
          {pageContent.sessions.map(sess => (
            <div key={sess.id}>
              <h2 style={{ marginBottom: 8, marginTop: 16 }}>
                {sess.current && (
                  <>
                    <span style={{ color: "lightgreen" }}>(this session)</span> •{" "}
                  </>
                )}
                {sess.readableUserAgent} •{" "}
                <button
                  onClick={() => {
                    terminateSession(sess.id)
                  }}
                >
                  Terminate
                </button>
              </h2>
              <p>
                Logged in: {moment.unix(sess.time).format("M/D/Y [at] LT")} • User Agent: {sess.userAgent}
              </p>
            </div>
          ))}
          <h1>Other Options</h1>
          <p>
            {/* <button onClick={() => setOpenModal("modal1")} style={{ backgroundColor: "#ff000088" }}>
              Delete All Shares
            </button> */}
            <button onClick={() => setOpenModal("deleteAccount")} style={{ backgroundColor: "#ff000088" }}>
              Delete Account
            </button>
          </p>
        </div>
      ) : (
        <p></p>
      )}
    </Layout>
  )
}

export const query = graphql`
  query {
    site {
      siteMetadata {
        apiLocation
      }
    }
  }
`

export default AccountPage
