import { fetch } from '../utils'
import { MediaWikiAPI } from './media-wiki-api'

const BASE_URL = 'https://ja.wikipedia.org/w/api.php'

export class WikipediaAPI extends MediaWikiAPI {
  constructor(fetcher: typeof fetch = fetch) {
    super(BASE_URL, fetcher)
  }
}
