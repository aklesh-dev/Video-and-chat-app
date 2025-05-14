import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ showSideBar = false, children }) => {
  return (
    <section className="min-h-screen">
      <div className="flex">
        {showSideBar && <Sidebar />}

        <div className="flex flex-col flex-1">
          <Navbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </section>
  )
}

export default Layout;