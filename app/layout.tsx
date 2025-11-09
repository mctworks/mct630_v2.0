import type { Metadata } from 'next'
import { DM_Serif_Text, Inter, Roboto_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { client } from '@/lib/makeswift/client'
import '@/lib/makeswift/components'
import { MakeswiftProvider } from '@/lib/makeswift/provider'
import { MakeswiftComponent } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'
import { ThemeConfig } from '@/components/ThemeConfig/ThemeConfig'
import './globals.css'

const body = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-family-body',
})
const heading = DM_Serif_Text({
  display: 'swap',
  subsets: ['latin'],
  weight: '400',
  variable: '--font-family-heading',
})
const mono = Roboto_Mono({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-family-mono',
})
const ztGatha = localFont({
  src: [
    {
      path: '../public/fonts/zt-gatha/ZTGatha-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-family-zt-gatha',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MCT630 | Michael C. Thompson | Full-Stack Web Developer',
  description:
    'Portfolio and Blog for Michael C. Thompson, a full-stack web developer specializing in front-end development based in the Atlanta area.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const navSnapshot = await client.getComponentSnapshot(
    'global-nav-menu',
    { siteVersion: getSiteVersion() }
  )
  
  return (
    <html lang="en">
      <body className={`${body.variable} ${heading.variable} ${mono.variable} ${ztGatha.variable}`}>
        <div id="outer-container" className="outer-container">
          <MakeswiftProvider siteVersion={await getSiteVersion()}>
            <ThemeConfig>
              <MakeswiftComponent
                snapshot={navSnapshot}
                label="Nav Menu Plus"
                type="navigation"
              />
              <main id="page-wrap" className="page-wrap">
                {children}
              </main>
            </ThemeConfig>
          </MakeswiftProvider>
        </div>
      </body>
    </html>
  )
}