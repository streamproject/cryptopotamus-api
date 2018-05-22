import { STREAMLABS_CLIENT_ID, STREAMLABS_CLIENT_SECRET, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from './config'

export const twitchToken = {
  client_id: TWITCH_CLIENT_ID,
  client_secret: TWITCH_CLIENT_SECRET,
  grant_type: 'authorization_code',
  redirect_uri: 'http://localhost:8000/api/v1/auth/twitch/callback',
}

export const streamlabsToken = {
  grant_type: 'authorization_code',
  client_id: STREAMLABS_CLIENT_ID,
  client_secret: STREAMLABS_CLIENT_SECRET,
  redirect_uri: 'http://localhost:8000/api/v1/auth/streamlabs/callback',
}

export const twitchStrategyOptions = {
  clientID: TWITCH_CLIENT_ID,
  clientSecret: TWITCH_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/api/v1/auth/twitch/callback',
  scope: 'user_read',
}

export const streamlabsStrategyOptions = {
  clientID: STREAMLABS_CLIENT_ID,
  clientSecret: STREAMLABS_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/api/v1/auth/streamlabs/callback',
  scope: ['alerts.create', 'donations.create'],
}
