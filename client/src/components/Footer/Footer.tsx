import "./Footer.sass"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import Logo from "../common/Logo"

export default function Footer() {
  return (
    <footer className="footer">
      <div className={"logo-container"}>
        <a href={"https://kenharmon.net"}>
          <Logo width={45} height={45}/>
        </a>
      </div>
      <div>
        <div>© 2025 Ken Harmon. All rights reserved.</div>
      </div>
      <div>
        <a href={"https://github.com/kharmon11/weatherapp"}>
          <FontAwesomeIcon icon={['fab', 'github']} size={"3x"} color={"#ddd"}/>
        </a>
      </div>
    </footer>
  )
}