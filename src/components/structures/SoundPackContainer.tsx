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

import React from "react";

import { SoundPack } from "../../settings/enums/SoundPack";
import SettingsStore from "../../settings/SettingsStore";

/*
 * The default sounds are played by calling .play() on these elements.
 * Sound packs are implemented by setting the sources to different sources.
 */

interface IProps {
}

interface IState {
    soundPack?: SoundPack;
}

export default class SoundPackContainer extends React.Component<IProps, IState> {
    private watcher: string;
    private containerRef: React.RefObject<HTMLDivElement>;

    constructor(props: IProps) {
        super(props);

        this.containerRef = React.createRef();

        this.state = {
            soundPack: SettingsStore.getValue("soundPack"),
        };

        this.watcher = SettingsStore.watchSetting("soundPack", null, (...[,,,, value]) =>
            this.setState({ soundPack: value as SoundPack }),
        );
    }

    public componentWillUnmount() {
        SettingsStore.unwatchSetting(this.watcher);
    }

    public render() {
        return (
            <div className="mx_SoundPackContainer" ref={this.containerRef}>
                <audio id="messageAudio">
                    <source src={`media/${this.state.soundPack}/message.ogg`} type="audio/ogg" />
                    <source src={`media/${this.state.soundPack}/message.mp3`} type="audio/mpeg" />
                </audio>
                <audio id="ringAudio" loop>
                    <source src={`media/${this.state.soundPack}/ring.ogg`} type="audio/ogg" />
                    <source src={`media/${this.state.soundPack}/ring.mp3`} type="audio/mpeg" />
                </audio>
                <audio id="ringbackAudio" loop>
                    <source src={`media/${this.state.soundPack}/ringback.ogg`} type="audio/ogg" />
                    <source src={`media/${this.state.soundPack}/ringback.mp3`} type="audio/mpeg" />
                </audio>
                <audio id="callendAudio">
                    <source src={`media/${this.state.soundPack}/callend.ogg`} type="audio/ogg" />
                    <source src={`media/${this.state.soundPack}/callend.mp3`} type="audio/mpeg" />
                </audio>
                <audio id="busyAudio">
                    <source src={`media/${this.state.soundPack}/busy.ogg`} type="audio/ogg" />
                    <source src={`media/${this.state.soundPack}/busy.mp3`} type="audio/mpeg" />
                </audio>
            </div>
        );
    }

    /*
     * React optimises the update by only altering the source elements, not the audio.
     * Because the audio stays the same, the browser won't load the new sources until we call .load() on the audio element.
     * This function called .load() after the sources are updated.
     */
    componentDidUpdate() {
        this.containerRef.current.querySelectorAll("audio").forEach(a => a.load());
    }
}
