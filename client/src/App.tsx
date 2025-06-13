import './App.sass'

import Body from "./components/Body/Body.tsx"

function Header() {
    return (
        <header className="header">

        </header>
    )
}

function Footer() {
    return (
        <footer className="footer">

        </footer>
    )
}

function App() {
    return (
        <div className="App">
            <Header/>
            <Body/>
            <Footer/>
        </div>
    )
}

export default App
