export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background antialiased",
        fontSans.variable
      )}>
        {children}
      </body>
    </html>
  )
} 