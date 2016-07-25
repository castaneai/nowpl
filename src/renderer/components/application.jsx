import React from 'react'
import iTunesWin from 'itunes-win'
import ArtworkView from './artwork-view'

export default class Application extends React.Component
{
    constructor(props) {
        super(props)
        this.state = {track: {title: '', artist: '', artwork: null}}
    }

    render() {
        console.log('application render')
        return (
            <div>
                <ArtworkView artwork={this.state.track.artwork} />
                <p>#nowplaying {this.state.track.name} - {this.state.track.artist}</p>
                <button onClick={this.onClickGetNowPlayingButton.bind(this)}>get nowplaying</button>
            </div>
        )
    }

    onClickGetNowPlayingButton() {
        iTunesWin.getCurrentTrack((err, track) => {
            if (!err) {
                console.log(track)
                this.setState({track: track})
            }
        })
    }
}