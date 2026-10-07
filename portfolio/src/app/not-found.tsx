// Fallback 404 for requests outside a locale (e.g. an invalid locale segment).
// The root layout is a pass-through, so this page brings its own <html>/<body>.
export default function RootNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#07070a",
          color: "#ecebe6",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <main>
          <p style={{ fontSize: 96, fontWeight: 700, margin: 0, color: "#00ffc6" }}>404</p>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>الصفحة غير موجودة · Page not found</h1>
          <a href="/" style={{ color: "#00ffc6" }}>
            العودة للرئيسية · Back home
          </a>
        </main>
      </body>
    </html>
  );
}
