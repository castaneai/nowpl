import { Promise } from 'es6-promise'
const TwitterApi = require('node-twitter-api')

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
