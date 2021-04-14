import { graphql } from "gatsby"
import React from "react"
import { useState, useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"

import Layout from "../components/layout"
import LoadingRing from "../components/loadingring"

const SignIn = ({ data }) => {
  const api = data.site.siteMetadata.apiLocation
  const [loading, setLoading] = useState(false)
  async function trySignup(event) {
    event.preventDefault()
    console.log(formData)
    // return
    setLoading(true)
    let signupResult = await (
      await fetch(api + "/signup", { credentials: "include", method: "post", body: JSON.stringify(formData) }).catch(() => {
        setErrorMsg("Error connecting to the server.")
        setLoading(false)
      })
    ).json()
    setLoading(false)
    if (!signupResult) return
    console.log(signupResult)
    if (signupResult.status == "error") {
      setErrorMsg(signupResult.error)
      recaptchaRef.current.reset()
    }
    if (signupResult.status == "success") {
      setLoading(true)
      let signinResult = await (
        await fetch(api + "/signin", { credentials: "include", method: "post", body: JSON.stringify(formData) }).catch(() => {
          setErrorMsg("Error connecting to the server.")
          setLoading(false)
        })
      ).json()
      setLoading(false)
      if (!signinResult) return
      console.log(signinResult)
      if (signinResult.status == "error") {
        setErrorMsg(signinResult.error)
      }
      if (signinResult.status == "success") {
        var intent = localStorage.getItem("intent")
        localStorage.removeItem("intent")
        window.location = intent ? intent : "/"
        setLoading(true)
      }
    }
  }
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [errorMsg, setErrorMsg] = useState("")
  const recaptchaRef = useRef()
  return (
    <Layout disableTopPadding>
      <div className="topwhenmobile" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", width: "100%", height: "100%" }}>
        <div id="nameEnter" style={{ marginTop: 84 }}>
          <form onSubmit={trySignup} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1>Create a {data.site.siteMetadata.title} Account</h1>
            <p style={{ marginTop: 0 }}>
              or <a href="/signin">sign in</a> if you have one already
            </p>
            <input
              className="hoverfancy"
              type="text"
              name="actualname"
              value={formData.actualname}
              onChange={event => {
                setFormData({ ...formData, actualname: event.target.value })
              }}
              placeholder="Actual Name"
            />
            <input
              className="hoverfancy"
              type="text"
              name="username"
              value={formData.username}
              onChange={event => {
                setFormData({ ...formData, username: event.target.value })
              }}
              placeholder="Username"
            />
            <input
              className="hoverfancy"
              type="password"
              name="password"
              value={formData.password}
              onChange={event => {
                setFormData({ ...formData, password: event.target.value })
              }}
              placeholder="Password"
            />
            <div style={{ marginTop: 6, marginBottom: 2 }}>
              <ReCAPTCHA ref={recaptchaRef} theme="dark" sitekey={data.site.siteMetadata.recaptchaSitekey} onChange={value => setFormData({ ...formData, "g-recaptcha-response": value })} />
            </div>
            <div className="horizPanel">
              <button className="hoverfancy" style={{ width: "fit-content", marginTop: 8 }} type="submit">
                Create Account
              </button>
              <LoadingRing size="24px" active={loading} />
            </div>
          </form>
          <p style={{ color: "red" }}>{errorMsg}</p>
        </div>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query {
    site {
      siteMetadata {
        title
        apiLocation
        recaptchaSitekey
      }
    }
  }
`

export default SignIn
