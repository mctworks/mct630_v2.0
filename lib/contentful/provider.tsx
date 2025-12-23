'use client'

import { ReactNode, createContext, useContext } from 'react'

import { GetBlogsQuery } from '@/generated/contentful'

type CollectionType = GetBlogsQuery['blogPostCollection']

const ContentfulContext = createContext<
  { data: NonNullable<CollectionType>['items'] } | undefined
>(undefined)

export function ContentfulProvider({
  children,
  value,
}: {
  children: ReactNode
  value: CollectionType | NonNullable<CollectionType>['items']
}) {
  // Normalize value so consumers always receive an array of items
  const items = Array.isArray(value) ? value : (value?.items ?? [])
  return <ContentfulContext.Provider value={{ data: items }}>{children}</ContentfulContext.Provider>
}

export function useContentfulData() {
  const context = useContext(ContentfulContext)

  if (context === undefined) {
    return { error: 'useContentfulData must be used within a ContentfulProvider' }
  }

  if (!context.data || !Array.isArray(context.data)) {
    return { error: 'No data found' }
  }

  return { data: context.data }
}
