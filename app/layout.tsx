import type { Metadata } from 'next'
import { Poppins, Roboto_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { client } from '@/lib/makeswift/client'
import '@/lib/makeswift/components'
import { MakeswiftProvider } from '@/lib/makeswift/provider'
import { MakeswiftComponent } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'
import { ThemeConfig } from '@/components/ThemeConfig/ThemeConfig'
import NavMenuPlus from '@/components/NavMenuPlus/NavMenuPlus'
import TransitionHandler from '@/components/TransitionHandler/TransitionHandler'
import './globals.css'

const body = Poppins({
  display: 'swap',
  subsets: ['latin'],
  weight: '400',
  variable: '--font-family-body',
})
const ztGatha = localFont({
  display: 'swap',
  src:'../public/fonts/zt-gatha/ZTGatha-SemiBold.ttf',
  variable: '--font-family-zt-gatha',
})
const heading = ztGatha

const mono = Roboto_Mono({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-family-mono',
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
  // Nav Snapshot fetch
  let navSnapshot = null
  try {
  navSnapshot = await client.getComponentSnapshot(
    'global-nav-menu',
    { siteVersion: await getSiteVersion() }
  )
} catch (err) {
  console.warn('Could not fetch navSnapshot:', err)
}

  return (
    <html lang="en">
      <body className={`${body.variable} ${heading.variable} ${mono.variable} ${ztGatha.variable}`}>
        <div id="outer-container">
          <MakeswiftProvider siteVersion={await getSiteVersion()}>
            <ThemeConfig>
              {navSnapshot ? (
                <MakeswiftComponent snapshot={navSnapshot} label="Nav Menu Plus" type="navigation"/>
              ) : (
                <NavMenuPlus 
                  className="global-nav"
                  logo={undefined}
                  links={undefined}
                  headerBar={undefined}
                />
              )}
              <TransitionHandler />
              
              <main id="page-wrap" className="page-wrap">
                <div id="page-wrap-inner" className="page-wrap-inner">
                  {children}
                </div>
              </main>
            </ThemeConfig>
          </MakeswiftProvider>
        </div>
      </body>
    </html>
  )
}