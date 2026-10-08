import { google } from 'googleapis'

export async function notifyGoogleIndexing(url) {
  try {
    const jwtClient = new google.auth.JWT({
  email: process.env.GOOGLE_INDEXING_CLIENT_EMAIL,
  key: process.env.GOOGLE_INDEXING_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/indexing'],
  })

    await jwtClient.authorize()

    const indexing = google.indexing({ version: 'v3', auth: jwtClient })

    const res = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type: 'URL_UPDATED',
      },
    })

    return { success: true, data: res.data }
  } catch (error) {
    console.error('Google Indexing API error:', error.message)
    return { success: false, error: error.message }
  }
}