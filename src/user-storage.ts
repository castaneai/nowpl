import * as storage from 'electron-json-storage'
import { TwitterAuth, TwitterCredentials } from './twitter'
import { Promise } from 'es6-promise'
import { BrowserWindow } from 'electron'

const TWITTER_CREDENTIALS_KEY = 'twitter-credentials'

export class UserStorage {

    static getTwitterCredentials(): Promise<TwitterCredentials> {
        return new Promise<TwitterCredentials>((resolve, reject) => {
            storage.has(TWITTER_CREDENTIALS_KEY, (err, hasKey) => {
                if (err) {
                    reject(err)
                }
                if (hasKey) {
                    storage.get(TWITTER_CREDENTIALS_KEY, (err, result) => {
                        if (err) {
                            reject(err)
                        }
                        resolve(result as TwitterCredentials)
                    })
                    return
                }
                this.fetchTwitterCredentials()
                .then(result => {
                    storage.set(TWITTER_CREDENTIALS_KEY, result, (err) => {
                        if (err) {
                            reject(err)
                        }
                        resolve(result as TwitterCredentials)
                    })
                })
            })
        })
    }

    private static fetchTwitterCredentials(): Promise<TwitterCredentials> {
        return new Promise<TwitterCredentials>((resolve, reject) => {
            const twitterAuth = new TwitterAuth()
            const apiKey = {
                consumerKey: 'ey9y4njOQSktTa5GcWKdueqQJ',
                consumerSecret: 'k42ua5c8sETtK7ozPgsXShgXz7fTR9IqB8ezlg9DhHNNgqzHK1'
            }
            twitterAuth.getRequestToken(apiKey)
            .then(requestToken => {
                const authWindow = new BrowserWindow()
                authWindow.webContents.on('did-get-redirect-request', (_, oldUrl, newUrl) => {
                    const matched = newUrl.match(/\?oauth_token=([^&]*)&oauth_verifier=([^&]*)/)
                    if (matched) {
                        authWindow.close()
                        const oauthVerifier = matched[2]
                        twitterAuth.getAccessToken(requestToken, oauthVerifier)
                        .then(accessToken => {
                            const twitterCredentials = {
                                consumerKey: apiKey.consumerKey,
                                consumerSecret: apiKey.consumerSecret,
                                accessToken: accessToken.accessToken,
                                accessTokenSecret: accessToken.accessTokenSecret,
                            }
                            resolve(twitterCredentials)
                        })
                    }
                })
                authWindow.loadURL(requestToken.authUrl)
            })
        })
    }
}
