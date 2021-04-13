import { graphql } from "gatsby"
import React from "react"
import { useState } from "react"
import Layout from "../components/layout"
import LoadingRing from "../components/loadingring"

const SignUp = ({ data }) => {
  const api = data.site.siteMetadata.apiLocation
  const [loading, setLoading] = useState(false)
  async function trySignin(event) {
    event.preventDefault()
    console.log(formData)
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
      window.location = "/"
      setLoading(true)
    }
  }
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [errorMsg, setErrorMsg] = useState("")
  return (
    <Layout disableTopPadding>
      <div className="topwhenmobile" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", width: "100%", height: "100%" }}>
        <div id="nameEnter" style={{ marginTop: 84 }}>
          <form onSubmit={trySignin} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1>Sign in to {data.site.siteMetadata.title}</h1>
            <p style={{ marginTop: 0 }}>
              or <a href="/signup">sign up</a> if you don't have an account
            </p>
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
            <div className="horizPanel">
              <button className="hoverfancy" style={{ width: "fit-content", marginTop: 8 }} type="submit">
                Sign In
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
      }
    }
  }
`

export default SignUp
