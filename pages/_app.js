import '../styles/globals.css'
import '../styles/tailwind.css';
import Image from 'next/image'

const Header = () => {
  return (
    <nav className="flex items-center justify-between flex-wrap bg-[#0176fe] p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Image
          src="/images/logo.svg"
          alt="logo"
          width={150}
          height={50}
        />
      </div>
    </nav>
  )
}

const MyApp = ({ Component, pageProps }) => {
  return (
  <>
    <Header/>
    <Component {...pageProps} />
  </>
  )
}

export default MyApp;
