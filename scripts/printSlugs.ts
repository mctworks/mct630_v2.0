import 'dotenv/config'
import { client } from '../lib/contentful/client.ts'

async function main() {
  try {
    const QUERY = `
      query GetAllSlugs { 
        blogPostCollection(limit: 100) {
          items {
            slug
            banner { url }
          }
        }
      }
    `

    const data: any = await client.request(QUERY)
    const items = data?.blogPostCollection?.items || []
    console.log('found', items.length, 'blogs')
    for (const item of items) {
      console.log(item.slug, 'banner url =', item.banner?.url)
    }
  } catch (e) {
    console.error('error', e)
  }
}

main()
