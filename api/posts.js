import { createValidator } from '../lib/schemas.js'
import { publicServerDb, userDbs } from '../db/index.js'
import { constructEntryUrl, parseEntryUrl, constructUserUrl, extractUserUrl } from '../lib/strings.js'

const listParam = createValidator({
  type: 'object',
  additionalProperties: false,
  properties: {
    lt: {type: 'string'},
    lte: {type: 'string'},
    gt: {type: 'string'},
    gte: {type: 'string'},
    reverse: {type: 'boolean'},
    limit: {type: 'number'}
  }
})

export function setup (wsServer) {
  wsServer.register('posts.listFeaturedFeed', async params => {
    return 'todo'
  })

  wsServer.register('posts.listUserFeed', async ([username, opts]) => {
    if (opts) {
      listParam.assert(opts)
    }
    opts = opts || {}
    opts.limit = opts.limit && typeof opts.limit === 'number' ? opts.limit : 100
    opts.limit = Math.max(Math.min(opts.limit, 100), 1)

    const userDb = userDbs.get(username)
    if (!userDb) throw new Error('User database not found')

    const entries = await userDb.posts.list(opts)
    const authorsCache = {}
    for (let entry of entries) {
      entry.url = constructEntryUrl(userDb.posts.schema.url, username, entry.key)
      entry.author = await fetchAuthor(username, authorsCache)
      entry.votes = await fetchVotes(entry)
      entry.commentCount = await fetchCommentCount(entry)
    }
    return entries
  })

  wsServer.register('posts.listMyFeed', async params => {
    return 'todo'
  })

  wsServer.register('posts.get', async ([username, key]) => {
    if (!key && username) {
      let parsed = parseEntryUrl(username, {enforceOurOrigin: true})
      username = parsed.username
      key = parsed.key
      if (parsed.schemaUrl !== 'https://ctzn.network/post.json') {
        throw new Error('Not a post URL')
      }
    }

    const userDb = userDbs.get(username)
    if (!userDb) throw new Error('User database not found')

    const postEntry = await userDb.posts.get(key)
    if (!postEntry) {
      throw new Error('Post not found')
    }
    postEntry.url = constructEntryUrl(userDb.posts.schema.url, username, postEntry.key)
    postEntry.author = await fetchAuthor(username)
    postEntry.votes = await fetchVotes(postEntry)
    postEntry.commentCount = await fetchCommentCount(postEntry)

    return postEntry
  })

  wsServer.register('posts.create', async ([post], client) => {
    if (!client?.auth) throw new Error('Must be logged in')
    const userDb = userDbs.get(client.auth.username)
    if (!userDb) throw new Error('User database not found')

    const key = ''+Date.now()
    post.createdAt = (new Date()).toISOString()
    await userDb.posts.put(key, post)
    
    const url = constructEntryUrl(userDb.posts.schema.url, client.auth.username, key)
    return {key, url}
  })

  wsServer.register('posts.edit', async ([key, post], client) => {
    if (!client?.auth) throw new Error('Must be logged in')
    const userDb = userDbs.get(client.auth.username)
    if (!userDb) throw new Error('User database not found')

    const postEntry = await userDb.posts.get(key)
    if (!postEntry) {
      throw new Error('Post not found')
    }

    postEntry.value.text = post?.text
    await userDb.posts.put(key, postEntry.value)

    const url = constructEntryUrl(userDb.posts.schema.url, client.auth.username, postEntry.key)
    return {key, url}
  })

  wsServer.register('posts.del', async ([key], client) => {
    if (!client?.auth) throw new Error('Must be logged in')
    const userDb = userDbs.get(client.auth.username)
    if (!userDb) throw new Error('User database not found')

    await userDb.posts.del(key)
  })
}

async function fetchAuthor (authorUsername, cache = undefined) {
  if (cache && cache[authorUsername]) {
    return cache[authorUsername]
  } else {
    let userDb = userDbs.get(authorUsername)
    let profileEntry
    if (userDb) profileEntry = await userDb.profile.get('self')
    let author = {
      url: constructUserUrl(authorUsername),
      username: authorUsername,
      displayName: profileEntry?.value?.displayName || authorUsername
    }
    if (cache) cache[authorUsername] = author
    return author
  }
}

async function fetchVotes (post) {
  let votesIdxEntry
  try {
    votesIdxEntry = await publicServerDb.votesIdx.get(post.url)
  } catch (e) {}
  return {
    upvoterUrls: (votesIdxEntry?.value?.upvoteUrls || []).map(extractUserUrl),
    downvoterUrls: (votesIdxEntry?.value?.downvoteUrls || []).map(extractUserUrl)
  }
}

async function fetchCommentCount (post) {
  let commentsIdxEntry
  try {
    commentsIdxEntry = await publicServerDb.commentsIdx.get(post.url)
  } catch (e) {}
  return commentsIdxEntry?.value.commentUrls.length || 0
}