import * as React from "react"
import { useEffect, useState } from "react"

import Layout from "../components/layout"

import * as pageStyle from "./index.module.css"
import * as aboutPageStyle from "./about.module.css"

const IndexPage = () => {
  const [scrolled, setScrolled] = useState(false)
  function checkScroll(event) {
    // console.log(window.scrollY)
    setScrolled(window.scrollY != 0)
  }
  useEffect(() => {
    document.onscroll = checkScroll
  }, [])
  return (
    <Layout disableTopPadding transparentHeader={!scrolled}>
      <div className={pageStyle.coveringContent} id="scrollCheckContainer">
        <div>
          <h1>Write, practice, test, easy.</h1>
          <h2>The coding platform for APCS students and teachers.</h2>
        </div>
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
          Components 1 and 2 are hosted on <a href="https://vercel.com/">Vercel</a> (a serverless hosting platform). Component 3 is hosted on a VPS
          (Virtual Private Server) on <a href="https://vultr.com/">Vultr</a>. Of the runner nodes, one is hosted on Vultr as a failsafe, but the rest
          are hosted personally by various individuals.
        </p>
        <h2>Is the API publicly available / documented?</h2>
        <p>
          The API is publicly available at <code>https://codetools.cy2.me/api</code> but there is sadly no documentation available at the moment. This
          may arrive in the future.
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
        <h2>Made with 💙 and </h2>
        <img src="/Gatsby-Logo.svg" />
        <img src="/flask.png" />
        <img src="/mongodb_leaf.svg" />
        <img src="/websockets.svg" />
      </div>
    </Layout>
  )
}

export default IndexPage
