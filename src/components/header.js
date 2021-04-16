import * as React from "react"
import { useEffect, useState, useRef } from "react"
import PropTypes from "prop-types"
import { graphql, Link, useStaticQuery } from "gatsby"
import { Helmet } from "react-helmet"

const Header = ({ pageName, hideButtons = false, hideEditorButton = false, noTabTitle = false, transparent = false }) => {
  const headerQuery = useStaticQuery(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)
  // const api = headerQuery.site.siteMetadata.apiLocation
  const api = process.env.GATSBY_API_URL
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  // const [menuOpen, setMenuOpen] = useState({ buttonFocus: false, menuFocus: false })
  const menu = useRef(null)
  useEffect(async function () {
    // document.querySelector("html").onclick = () => {
    //   setMenuOpen(false)
    // }
    console.log(api)
    let acctData = await (await fetch(api + "/accountdata", { credentials: "include" })).json()
    console.log(acctData)
    if (acctData.status == "error") {
      setUser({ active: false })
    } else {
      setUser({
        active: true,
        username: acctData.data.username,
      })
    }
  }, [])
  async function signOut() {
    console.log(await (await fetch(api + "/signout", { credentials: "include" })).json())
    setUser({ active: false })
    setMenuOpen(false)
    if (window.location.pathname != "/") window.location = "/"
  }
  return (
    <>
      <Helmet title={noTabTitle || !pageName ? headerQuery.site.siteMetadata.title : pageName + " - " + headerQuery.site.siteMetadata.title} />
      <div style={{ position: "fixed", display: "flex", width: "100%", justifyContent: "center", zIndex: 200 }}>
        <div id="alertMessage" className="invertAdaptBackground">
          Alert
        </div>
      </div>
      <div
        id="header"
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          height: 84,
          display: "flex",
          alignItems: "center",
          zIndex: 50,
          justifyContent: "center",
          background: transparent ? "none" : null,
          backdropFilter: transparent ? "none" : null,
        }}
      >
        <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
          <img
            src="/CodeToolsLogo.svg"
            className="hoverfancy"
            style={{ height: 64, marginLeft: 10, justifySelf: "center", cursor: "pointer" }}
            alt="CodeTools"
            onClick={() => {
              window.location = "/"
            }}
          />
          <h1
            className="nomobile"
            style={{ marginLeft: 16, cursor: "pointer", zIndex: 5 }}
            onClick={() => {
              window.location = "/"
            }}
          >
            {headerQuery.site.siteMetadata.title}
          </h1>
          <h2 className="nomobile" style={{ justifySelf: "flex-start", marginLeft: 16, color: "lightblue" }}>
            {pageName}
          </h2>
        </div>
        <div style={{ display: "flex" }} />
        <div className="headerButtons" style={{ display: "flex", justifyContent: "flex-end" }}>
          {!hideButtons && user && (
            <>
              {!hideEditorButton && (
                <button
                  className="hoverfancy"
                  // onclick="fadeThenGo('/testeditor')"
                  onClick={() => {
                    if (!user.active) localStorage.setItem("intent", "/mystuff")
                    window.location = user.active ? "/mystuff" : "/signup"
                  }}
                  style={{
                    marginRight: 16,
                    marginLeft: 8,
                    height: 48,
                    paddingLeft: 16,
                    paddingRight: 16,
                    backgroundColor: "#FFFFFF",
                    color: "black",
                  }}
                >
                  {user.active ? "My Stuff" : "Code Now"}
                </button>
              )}
              <button
                className="activefancy"
                style={{ marginRight: 16, height: 48, paddingLeft: 10, paddingRight: 10, display: "flex", alignItems: "center", outline: "none" }}
                onClick={
                  user.active
                    ? () => {
                        setMenuOpen(!menuOpen)
                      }
                    : () => {
                        window.location = "/signin"
                      }
                }
                // onFocus={() => {
                //   setMenuOpen({ ...menuOpen, buttonFocus: true })
                // }}
                // onBlur={() => {
                //   setMenuOpen({ ...menuOpen, buttonFocus: false })
                // }}
              >
                {(user.active && (
                  <>
                    <i className="material-icons" style={{ color: "white" }}>
                      person
                    </i>
                    <p style={{ marginLeft: 6, marginRight: 6 }}>{user.username}</p>
                    <i className="material-icons expand-in-activefancy" style={{ color: "white" }}>
                      expand_more
                    </i>
                  </>
                )) ||
                  "Sign In"}
              </button>
            </>
          )}
        </div>
      </div>
      <div
        id="profileMenu"
        className="dropMenu"
        style={{
          zIndex: 100,
          display: menuOpen ? "flex" : "none",
          alignItems: "center",
          // display: menuOpen.buttonFocus || menuOpen.menuFocus ? "flex" : "none",
          position: "fixed",
          right: 16,
          top: 74,
          flexDirection: "column",
          backgroundColor: "#22222288",
          backdropFilter: "saturate(180%) blur(20px)",
          padding: 1,
          borderRadius: 8,
          animation: "drop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
        // onFocus={() => {
        //   setMenuOpen({ ...menuOpen, menuFocus: true })
        // }}
        // onBlur={() => {
        //   setMenuOpen({ ...menuOpen, menuFocus: false })
        // }}
      >
        <a className="activefancy button-like" href="/mystuff">
          My Stuff
        </a>
        <a className="activefancy button-like" href="/account">
          My Account
        </a>
        <a className="activefancy button-like" onClick={signOut}>
          Sign Out
        </a>
        <a href="/about" style={{ all: "unset", marginBlock: "4px", textDecoration: "underline", cursor: "pointer" }}>
          About
        </a>
      </div>
    </>
  )
}

const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`

export default Header
