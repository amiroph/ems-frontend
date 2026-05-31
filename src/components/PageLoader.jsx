export default function PageLoader() {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F5F7FA" }}>
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 animate-pulse"
            style={{ backgroundColor: "#1E3A5F" }}
          >
            🏢
          </div>
          <p className="text-sm font-semibold" style={{ color: "#718096" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }