import React from "react";
import SettingsStore from "../../settings/SettingsStore"

/*
 * The default sounds are played by calling .play() on these elements.
 * Sound packs are implemented by setting the sources to different sources.
 */

interface IProps {
}

interface IState {
    soundPack?: string;
}

export default class SoundPackContainer extends React.Component<IProps, IState> {
    constructor(props, context) {
        super(props, context)
        this.state = {
            soundPack: SettingsStore.getValue("soundPack")
        }
        this.watcher = SettingsStore.watchSetting("soundPack", null, (...[,,,, value]) =>
            this.setState({ soundPack: value as string })
        )
    }

    public componentWillUnmount() {
        SettingsStore.unwatchSetting(this.watcher)
    }

    public render() {
        return (
            <div class="mx_SoundPackContainer" ref="container">
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
        )
    }

    /*
     * React optimises the update by only altering the source elements, not the audio.
     * Because the audio stays the same, the browser won't load the new sources until we call .load() on the audio element.
     * This function called .load() after the sources are updated.
     */
    componentDidUpdate() {
        [...this.refs.container.querySelectorAll("audio")].forEach(a => a.load())
    }
}
