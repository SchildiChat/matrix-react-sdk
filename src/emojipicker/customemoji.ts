import { MatrixEvent } from 'matrix-js-sdk/src/matrix';

export function loadImageSet(imageSetEvent: MatrixEvent): ICustomEmoji[] {
    let loadedImages : ICustomEmoji[]= [];
    const images = imageSetEvent.getContent().images;
    if (!images) {
        return;
    }
    for (const imageKey in images) {
        const imageData = images[imageKey];
        loadedImages.push({
            shortcodes: [imageKey],
            url: imageData.url,
        });
    }
    return loadedImages;
}

export interface ICustomEmoji {
    shortcodes: string[];
    emoticon?: string;
    url: string;
}