import "./globals.css";

export const metadata = {
  title: "法语结构透视助手",
  description: "CIT693 Prototype",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
