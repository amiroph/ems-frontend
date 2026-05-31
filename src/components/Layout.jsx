import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F7FA" }}>
      <Navbar />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}