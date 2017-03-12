import * as fs from 'fs'
import { Promise } from 'es6-promise'
const TwitterApi = require('node-twitter-api')  // using require() because d.ts not found

function toBase64Image(imageFilePath: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		fs.readFile(imageFilePath, (err, data) => {
			if (err) {
				reject(err)
				return
			}
			resolve(data.toString('base64'))
		})
	})
}

export interface ConsumerKey {
	consumerKey: string
	consumerSecret: string
}

export interface RequestToken {
	requestToken: string
	requestTokenSecret: string
	authUrl: string
}

export interface AccessToken {
	accessToken: string
	accessTokenSecret: string
}

export interface TwitterCredentials extends ConsumerKey, AccessToken { }

export class TwitterAuth {

	private api: any

	getRequestToken(apiKey: ConsumerKey): Promise<RequestToken> {
		return new Promise<RequestToken>((resolve, reject) => {
			this.api = new TwitterApi({
				consumerKey: apiKey.consumerKey,
				consumerSecret: apiKey.consumerSecret,
				callback: 'http://twitter.com',
			})
			this.api.getRequestToken((err: any, requestToken: string, requestTokenSecret: string) => {
				if (err) {
					console.error(err)
					reject(err)
					return
				}
				resolve({
					requestToken: requestToken,
					requestTokenSecret: requestTokenSecret,
					authUrl: this.api.getAuthUrl(requestToken),
				})
			})
		})
	}

	getAccessToken(requestToken: RequestToken, oauthVerifier: string): Promise<AccessToken> {
		return new Promise<AccessToken>((resolve, reject) => {
			if (!this.api) {
				reject(new Error('Get request token before getting access token'))
				return
			}
			this.api.getAccessToken(requestToken.requestToken, requestToken.requestTokenSecret, oauthVerifier,
				(err: any, accessToken: string, accessTokenSecret: string) => {
					if (err) {
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

	/**
	 * 画像つきツイートする
	 * @param message ツイート本文
	 * @param imageFilePath 添付画像のファイルパス
	 */
	postTweetWithImage(message: string, imageFilePath: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			toBase64Image(imageFilePath).then((base64Data) => {
				this.api.uploadMedia({ media: base64Data, isBase64: true },
					this.credentials.accessToken,
					this.credentials.accessTokenSecret, (err: Error, mediaResponse: any) => {
						if (err) {
							reject(err)
							return
						}

						this.postTweet(message, mediaResponse.media_id_string).then(response => {
							resolve({
								uploadMediaResponse: mediaResponse,
								updateStatusesResponse: response,
							})
						}, err => {
							reject(err)
							return
						})
					})
			}, err => {
				reject(err)
				return
			})
		})
	}

	/**
	 * ツイートする
	 * @param message ツイート本文
	 * @param mediaId 添付メディアのID
	 */
	postTweet(message: string, mediaId: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			this.api.statuses('update', {
				status: message,
				media_ids: mediaId,
			}, this.credentials.accessToken, this.credentials.accessTokenSecret, (err: Error, response: any) => {
				if (err) {
					reject(err)
					return
				}
				resolve(response)
			})
		})
	}
}
