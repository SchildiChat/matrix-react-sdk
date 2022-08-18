/*
Copyright 2022

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { MatrixEvent } from 'matrix-js-sdk/src/matrix';

export function loadImageSet(imageSetEvent: MatrixEvent): ICustomEmoji[] {
    const loadedImages: ICustomEmoji[] = [];
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
