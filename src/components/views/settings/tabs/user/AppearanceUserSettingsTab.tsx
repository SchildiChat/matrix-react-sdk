/*
Copyright 2019 New Vector Ltd
Copyright 2019 - 2021 The Matrix.org Foundation C.I.C.

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

import { _t } from "../../../../../languageHandler";
import SdkConfig from "../../../../../SdkConfig";
import { MatrixClientPeg } from '../../../../../MatrixClientPeg';
import SettingsStore from "../../../../../settings/SettingsStore";
import SettingsFlag from '../../../elements/SettingsFlag';
import { SettingLevel } from "../../../../../settings/SettingLevel";
import { Layout } from "../../../../../settings/enums/Layout";
import LayoutSwitcher from "../../LayoutSwitcher";
import StyledRadioButton from '../../../elements/StyledRadioButton';
import { Theme } from '../../../../../settings/enums/Theme';
import { RoomListStyle } from '../../../../../settings/enums/RoomListStyle';
import FontScalingPanel from '../../FontScalingPanel';
import ThemeChoicePanel from '../../ThemeChoicePanel';
import ImageSizePanel from "../../ImageSizePanel";

interface IProps {
}

interface IThemeState {
    lightTheme: string;
    darkTheme: string;
    themeInUse: Theme;
}

export interface CustomThemeMessage {
    isError: boolean;
    text: string;
}

interface IState extends IThemeState {
    roomListStyle: RoomListStyle;
    layout: Layout;
    // User profile data for the message preview
    userId?: string;
    displayName: string;
    avatarUrl: string;
}

export default class AppearanceUserSettingsTab extends React.Component<IProps, IState> {
    private readonly MESSAGE_PREVIEW_TEXT = _t("Hey you. You're the best!");

    private unmounted = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            lightTheme: SettingsStore.getValue("light_theme"),
            darkTheme: SettingsStore.getValue("dark_theme"),
            themeInUse: SettingsStore.getValue("theme_in_use"),
            roomListStyle: SettingsStore.getValue("roomListStyle"),
            layout: SettingsStore.getValue("layout"),
            userId: null,
            displayName: null,
            avatarUrl: null,
        };
    }

    async componentDidMount() {
        // Fetch the current user profile for the message preview
        const client = MatrixClientPeg.get();
        const userId = client.getUserId();
        const profileInfo = await client.getProfileInfo(userId);
        if (this.unmounted) return;

        this.setState({
            userId,
            displayName: profileInfo.displayname,
            avatarUrl: profileInfo.avatar_url,
        });
    }

    componentWillUnmount() {
        this.unmounted = true;
    }

    private onRoomListStyleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const roomListStyle = e.target.value as RoomListStyle;
        this.setState({ roomListStyle: roomListStyle });
        SettingsStore.setValue("roomListStyle", null, SettingLevel.DEVICE, roomListStyle);
    };

    private onLayoutChanged = (layout: Layout): void => {
        this.setState({ layout: layout });
    };

    private renderRoomListSection() {
        const roomListStyleSection = <div className="mx_SettingsTab_multilineRadioSelectors">
            <label>
                <StyledRadioButton
                    name="room_list_style"
                    value={RoomListStyle.Compact}
                    checked={this.state.roomListStyle === RoomListStyle.Compact}
                    onChange={this.onRoomListStyleChange}
                >
                    { _t("Compact: tiny avatar together with name and preview in one line") }
                </StyledRadioButton>
            </label>
            <label>
                <StyledRadioButton
                    name="room_list_style"
                    value={RoomListStyle.Intermediate}
                    checked={this.state.roomListStyle === RoomListStyle.Intermediate}
                    onChange={this.onRoomListStyleChange}
                >
                    { _t("Intermediate: medium sized avatar with single-line preview") }
                </StyledRadioButton>
            </label>
            <label>
                <StyledRadioButton
                    name="room_list_style"
                    value={RoomListStyle.Roomy}
                    checked={this.state.roomListStyle === RoomListStyle.Roomy}
                    onChange={this.onRoomListStyleChange}
                >
                    { _t("Roomy: big avatar with two-line preview") }
                </StyledRadioButton>
            </label>
        </div>;

        return <>
            <div className="mx_SettingsTab_heading">{ _t("Room list") }</div>
            <div className="mx_SettingsTab_section mx_AppearanceUserSettingsTab_fontScaling">
                <SettingsFlag
                    name="unifiedRoomList"
                    level={SettingLevel.DEVICE}
                    useCheckbox={true}
                />
            </div>
            <div className="mx_SettingsTab_section mx_AppearanceUserSettingsTab_RoomListStyleSection">
                <span className="mx_SettingsTab_subheading">{ _t("Room list style") }</span>
                { roomListStyleSection }
            </div>
        </>;
    }

    render() {
        const brand = SdkConfig.get().brand;

        return (
            <div className="mx_SettingsTab mx_AppearanceUserSettingsTab">
                <div className="mx_SettingsTab_heading">{ _t("Customise your appearance") }</div>
                <div className="mx_SettingsTab_SubHeading">
                    { _t("Appearance Settings only affect this %(brand)s session.", { brand }) }
                </div>
                <ThemeChoicePanel />
                { this.renderRoomListSection() }
                <LayoutSwitcher
                    userId={this.state.userId}
                    displayName={this.state.displayName}
                    avatarUrl={this.state.avatarUrl}
                    messagePreviewText={this.MESSAGE_PREVIEW_TEXT}
                    onLayoutChanged={this.onLayoutChanged}
                />
                <FontScalingPanel />
                <ImageSizePanel />
            </div>
        );
    }
}
