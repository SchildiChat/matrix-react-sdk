/*
Copyright 2019 Tulir Asokan <tulir@maunium.net>
Copyright 2020 The Matrix.org Foundation C.I.C.

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

import React from 'react';

import { MenuItem } from "../../structures/ContextMenu";
import { IEmoji } from "../../../emoji";
import { ICustomEmoji } from '../../../emojipicker/customemoji';
import { mediaFromMxc } from '../../../customisations/Media';

interface IProps {
    emoji: IEmoji | ICustomEmoji;
    selectedEmojis?: Set<string>;
    onClick(emoji: IEmoji | ICustomEmoji): void;
    onMouseEnter(emoji: IEmoji | ICustomEmoji): void;
    onMouseLeave(emoji: IEmoji | ICustomEmoji): void;
}

class Emoji extends React.PureComponent<IProps> {
    render() {
        const { onClick, onMouseEnter, onMouseLeave, emoji, selectedEmojis } = this.props;

        let emojiElement: JSX.Element;
        if ('unicode' in emoji) {
            const isSelected = selectedEmojis && selectedEmojis.has(emoji.unicode);
            emojiElement = <div className={`mx_EmojiPicker_item ${isSelected ? 'mx_EmojiPicker_item_selected' : ''}`}>
                {emoji.unicode}
            </div>;
        } else {
            const mediaUrl = mediaFromMxc(emoji.url).getThumbnailOfSourceHttp(24, 24, 'scale');
            emojiElement = <div className="mx_EmojiPicker_item">
                <img
                    className="mx_customEmoji_image"
                    src={mediaUrl}
                    alt={emoji.shortcodes[0]} />
            </div>
        }
        emojiElement;

        return (
            <MenuItem
                element="li"
                onClick={() => onClick(emoji)}
                onMouseEnter={() => onMouseEnter(emoji)}
                onMouseLeave={() => onMouseLeave(emoji)}
                className="mx_EmojiPicker_item_wrapper"
                label={'unicode' in emoji ? emoji.unicode : emoji.shortcodes[0]}
            >
                {emojiElement}
            </MenuItem>
        );
    }
}

export default Emoji;
