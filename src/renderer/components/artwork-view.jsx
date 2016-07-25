import React from 'react'

export default class ArtworkView extends React.Component
{
    render() {
        const src = this.props.artwork ? this.getImageDataURI(this.props.artwork) : ''
        return <img className="artwork" src={src} />
    }
    
    getImageDataURI(artwork) {
        return 'data:' + this.getImageContentType(artwork.format) +
        ';base64,' + artwork.data.toString('base64')
    }

    getImageContentType(imageFormat) {
        switch (imageFormat) {
            case 'JPEG':
                return 'image/jpeg'
            case 'PNG':
                return 'image/png'
            case 'GIF':
                return 'image/gif'
        }
    }
}