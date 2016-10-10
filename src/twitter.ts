import { Promise } from 'es6-promise'
import { Artwork } from 'itunes-win'

const TwitterApi = require('node-twitter-api')


const getArtworkExt = (artwork: Artwork) => {
    switch (artwork.format) {
        case 'JPEG': return '.jpg'
        case 'PNG': return '.png'
        case 'GIF': return '.gif'
        default: return null
    }
}

export interface TwitterApiKey {
    consumerKey: string
    consumerSecret: string
}

export interface TwitterApiRequestToken {
    requestToken: string
    requestTokenSecret: string
    authUrl: string
}

export interface TwitterApiAccessToken {
    accessToken: string
    accessTokenSecret: string
}

export interface TwitterCredentials extends TwitterApiKey, TwitterApiAccessToken {}

export class TwitterAuth {

    private api: any

    getRequestToken(apiKey: TwitterApiKey): Promise<TwitterApiRequestToken> {
        const self = this
        return new Promise<TwitterApiRequestToken>((resolve, reject) => {
            self.api = new TwitterApi({
                consumerKey: apiKey.consumerKey,
                consumerSecret: apiKey.consumerSecret,
                callback: 'http://twitter.com',
            })
            self.api.getRequestToken((err: any, requestToken: string, requestTokenSecret: string) => {
                if (err) {
                    console.error(err)
                    reject(err)
                    return
                }
                resolve({
                    requestToken: requestToken,
                    requestTokenSecret: requestTokenSecret,
                    authUrl: self.api.getAuthUrl(requestToken),
                })
            })
        })
    }

    getAccessToken(requestToken: TwitterApiRequestToken, oauthVerifier: string): Promise<TwitterApiAccessToken> {
        if (this.api === null) {
            return Promise.reject<TwitterApiAccessToken>(new Error('Get request token before getting access token.'))
        }
        return new Promise<TwitterApiAccessToken>((resolve, reject) => {
            this.api.getAccessToken(requestToken.requestToken, requestToken.requestTokenSecret, oauthVerifier,
            (err: any, accessToken: string, accessTokenSecret: string) => {
                if (err) {
                    console.error(err)
                    reject(err)
                    return
                }
                resolve({
                    accessToken: accessToken,
                    accessTokenSecret: accessTokenSecret,
                })
            })
        })
    }
}

export class Twitter {

    private api: any

    constructor(private credentials: TwitterCredentials) {
        this.api = new TwitterApi({
            consumerKey: credentials.consumerKey,
            consumerSecret: credentials.consumerSecret,
            callback: 'http://twitter.com',
        })
    }

    postTweetWithImage(message: string, imageFilePath: string): void {
        this.api.uploadMedia({media: imageFilePath},
        this.credentials.accessToken,
        this.credentials.accessTokenSecret, (err: any, data: any, response: any) => {
            this.api.statuses('update', {
                status: message,
                media_ids: data.media_id_string,
            }, this.credentials.accessToken, this.credentials.accessTokenSecret, (err: any) => {})
        })
    }
}
