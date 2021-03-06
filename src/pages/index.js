import * as React from "react"
import { useEffect, useState, useRef } from "react"

import Layout from "../components/layout"

import * as pageStyle from "./index.module.css"
import * as aboutPageStyle from "./about.module.css"

const IndexPage = () => {
  const [scrolled, setScrolled] = useState(false)
  const poprx = useRef(null)
  const [rxData, setRxData] = useState(null)
  function checkScroll(event) {
    // console.log(window.scrollY)
    setScrolled(window.scrollY != 0)
  }
  function initWebsocket() {
    poprx.current = new WebSocket(process.env.GATSBY_ECWS_URL + "/ecws/poprx")
    poprx.current.addEventListener("open", () => {
      // console.log("ECWS connection opened")
    })
    poprx.current.addEventListener("message", event => {
      let data = JSON.parse(event.data)
      setRxData(data)
    })
    poprx.current.addEventListener("close", event => {
      // console.log("ECWS connection lost")
      setRxData(null)
      initWebsocket()
    })
  }
  useEffect(() => {
    document.onscroll = checkScroll
    initWebsocket()
  }, [])
  return (
    <Layout disableTopPadding transparentHeader={!scrolled}>
      <div className={pageStyle.coveringContent} id="scrollCheckContainer">
        <div className={pageStyle.centerContainer}>
          <h1>Write, practice, test, easy.</h1>
          <h2>The coding platform for APCS students and teachers.</h2>
        </div>
        {rxData && (
          <div className={pageStyle.cornerContainer}>
            <h1>{rxData.customers}</h1>
            <p>Coders Online</p>
            <h1>{rxData.employees}</h1>
            <p>Runner Nodes Online</p>
          </div>
        )}
      </div>
      <div className={pageStyle.backgroundImage}>
        <div />
      </div>
      <div className={aboutPageStyle.textContainer}>
        <h1>This is the CodeTools platform.</h1>
        <p>
          CodeTools is a platform that was built to make it easy to test code, and create challenges for others to solve, right in the browser. In
          this way, it is similar to other platforms, like Replit and CodingBat. However, it is simpler to use than Replit, and more modern than
          CodingBat.
        </p>
        <h2>How does CodeTools work?</h2>
        <p>
          CodeTools sends your code to a distributed network of "run nodes" that run your code in a secure environment. Completion of challenges is
          then identified server-side, and stored in a database.
        </p>
        <h2>How is CodeTools hosted?</h2>
        <p>CodeTools consists of 4 components</p>
        <ol>
          <li>Static Frontend</li>
          <li>Main API</li>
          <li>Runner Node Management Server</li>
          <li>Runner Nodes</li>
        </ol>
        <p>
          Components 1 and 2 are hosted on <a href="https://vercel.com/">Vercel</a> (a serverless hosting platform). The database for the API is
          hosted on <a href="https://www.mongodb.com/cloud/atlas">MongoDB Atlas</a>. Component 3 is hosted <a href="https://heroku.com/">Heroku</a>{" "}
          (another serverless hosting platform). The runner nodes are hosted personally by various individuals. Their higher system requirements make
          them harder to host serverless and very expensive to host on a VPS.
        </p>
        <h2>Is the API publicly available / documented?</h2>
        <p>
          The API is publicly available at <a href="https://codetools.cy2.me/api">https://codetools.cy2.me/api</a> but there is sadly no documentation
          available at the moment. This may arrive in the future.
        </p>
        <h2>Who are the contributors to CodeTools?</h2>
        <p>
          The majority of CodeTools was engineered and written by Cy Westbrook, a class of 2023 high school student in New Jersey. This includes
          components 1-3. Ramesh Balaji, a class of 2022 high school student in New Jersey, is responsible for the development of the runner nodes,
          and the execution of code in a secure environment.{" "}
        </p>
        <h2>Is CodeTools open source?</h2>
        <p>Yes. CodeTools is open source. Links will be available shortly.</p>
      </div>
      <div className={aboutPageStyle.imagesDiv}>
        {/* <img src="/vercel-logotype-light.svg" /> */}
        <h2>Made with ???? and </h2>
        <img src="/Gatsby-Logo.svg" />
        <img src="/flask.png" />
        <img src="/mongodb_leaf.svg" />
        <img src="/websockets.svg" />
      </div>
    </Layout>
  )
}

export default IndexPage
