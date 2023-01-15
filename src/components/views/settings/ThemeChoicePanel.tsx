/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
import { logger } from "matrix-js-sdk/src/logger";

import { _t } from "../../../languageHandler";
import SettingsStore from "../../../settings/SettingsStore";
import { getOrderedThemes } from "../../../theme";
import ThemeWatcher from "../../../settings/watchers/ThemeWatcher";
import AccessibleButton from "../elements/AccessibleButton";
import dis from "../../../dispatcher/dispatcher";
import { RecheckThemePayload } from '../../../dispatcher/payloads/RecheckThemePayload';
import { Action } from '../../../dispatcher/actions';
// import StyledCheckbox from '../elements/StyledCheckbox';
import Field from '../elements/Field';
import StyledRadioGroup from "../elements/StyledRadioGroup";
import { SettingLevel } from "../../../settings/SettingLevel";
import PosthogTrackers from "../../../PosthogTrackers";
import StyledRadioButton from '../elements/StyledRadioButton';
import { Theme } from '../../../settings/enums/Theme';
import { UserNameColorMode } from '../../../settings/enums/UserNameColorMode';
import { BorderRadius } from '../../../settings/enums/BorderRadius';

interface IProps {}

interface IThemeState {
    lightTheme: string;
    darkTheme: string;
    themeInUse: Theme;
    borderRadius: BorderRadius;
}

export interface CustomThemeMessage {
    isError: boolean;
    text: string;
}

interface IState extends IThemeState {
    customThemeUrl: string;
    customThemeMessage: CustomThemeMessage;
    showAdvancedThemeSettings: boolean;
    userNameColorModeDM: UserNameColorMode;
    userNameColorModeGroup: UserNameColorMode;
    userNameColorModePublic: UserNameColorMode;
}

export default class ThemeChoicePanel extends React.Component<IProps, IState> {
    private themeTimer: number;

    constructor(props: IProps) {
        super(props);

        this.state = {
            lightTheme: SettingsStore.getValue("light_theme"),
            darkTheme: SettingsStore.getValue("dark_theme"),
            themeInUse: SettingsStore.getValue("theme_in_use"),
            borderRadius: SettingsStore.getValue("borderRadius"),
            customThemeUrl: "",
            customThemeMessage: { isError: false, text: "" },
            showAdvancedThemeSettings: false,
            userNameColorModeDM: SettingsStore.getValue("userNameColorModeDM"),
            userNameColorModeGroup: SettingsStore.getValue("userNameColorModeGroup"),
            userNameColorModePublic: SettingsStore.getValue("userNameColorModePublic"),
        };
    }

    private onLightThemeChange = (newTheme: string): void => {
        if (this.state.lightTheme === newTheme) return;

        PosthogTrackers.trackInteraction("WebSettingsAppearanceTabThemeSelector");

        // doing getValue in the .catch will still return the value we failed to set,
        // so remember what the value was before we tried to set it so we can revert
        const oldTheme: string = SettingsStore.getValue('light_theme');
        SettingsStore.setValue("light_theme", null, SettingLevel.DEVICE, newTheme).catch(() => {
            dis.dispatch<RecheckThemePayload>({ action: Action.RecheckTheme });
            this.setState({ lightTheme: oldTheme });
        });
        this.setState({ lightTheme: newTheme });
        // The settings watcher doesn't fire until the echo comes back from the
        // server, so to make the theme change immediately we need to manually
        // do the dispatch now
        dis.dispatch<RecheckThemePayload>({ action: Action.RecheckTheme });
    };

    private onDarkThemeChange = (newTheme: string): void => {
        if (this.state.darkTheme === newTheme) return;

        // doing getValue in the .catch will still return the value we failed to set,
        // so remember what the value was before we tried to set it so we can revert
        const oldTheme: string = SettingsStore.getValue('dark_theme');
        SettingsStore.setValue("dark_theme", null, SettingLevel.DEVICE, newTheme).catch(() => {
            dis.dispatch<RecheckThemePayload>({ action: Action.RecheckTheme });
            this.setState({ darkTheme: oldTheme });
        });
        this.setState({ darkTheme: newTheme });
        // The settings watcher doesn't fire until the echo comes back from the
        // server, so to make the theme change immediately we need to manually
        // do the dispatch now
        dis.dispatch<RecheckThemePayload>({ action: Action.RecheckTheme });
    };

    private onThemeInUseChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const themeInUse = e.target.value as Theme;
        this.setState({ themeInUse: themeInUse });
        SettingsStore.setValue("theme_in_use", null, SettingLevel.DEVICE, themeInUse);
        dis.dispatch<RecheckThemePayload>({ action: Action.RecheckTheme });
    };

    private onBorderRadiusChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const borderRadius = e.target.value as BorderRadius;
        this.setState({ borderRadius: borderRadius });
        SettingsStore.setValue("borderRadius", null, SettingLevel.DEVICE, borderRadius);
    };

    private onAddCustomTheme = async (): Promise<void> => {
        let currentThemes: string[] = SettingsStore.getValue("custom_themes");
        if (!currentThemes) currentThemes = [];
        currentThemes = currentThemes.map((c) => c); // cheap clone

        if (this.themeTimer) {
            clearTimeout(this.themeTimer);
        }

        try {
            const r = await fetch(this.state.customThemeUrl);
            // XXX: need some schema for this
            const themeInfo = await r.json();
            if (!themeInfo || typeof themeInfo["name"] !== "string" || typeof themeInfo["colors"] !== "object") {
                this.setState({ customThemeMessage: { text: _t("Invalid theme schema."), isError: true } });
                return;
            }
            currentThemes.push(themeInfo);
        } catch (e) {
            logger.error(e);
            this.setState({ customThemeMessage: { text: _t("Error downloading theme information."), isError: true } });
            return; // Don't continue on error
        }

        await SettingsStore.setValue("custom_themes", null, SettingLevel.ACCOUNT, currentThemes);
        this.setState({ customThemeUrl: "", customThemeMessage: { text: _t("Theme added!"), isError: false } });

        this.themeTimer = window.setTimeout(() => {
            this.setState({ customThemeMessage: { text: "", isError: false } });
        }, 3000);
    };

    private onCustomThemeChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>): void => {
        this.setState({ customThemeUrl: e.target.value });
    };

    // private renderHighContrastCheckbox(): React.ReactElement<HTMLDivElement> {
    //     if (
    //         !this.state.useSystemTheme && (
    //             findHighContrastTheme(this.state.theme) ||
    //             isHighContrastTheme(this.state.theme)
    //         )
    //     ) {
    //         return <div>
    //             <StyledCheckbox
    //                 checked={isHighContrastTheme(this.state.theme)}
    //                 onChange={(e) => this.highContrastThemeChanged(e.target.checked)}
    //             >
    //                 { _t("Use high contrast") }
    //             </StyledCheckbox>
    //         </div>;
    //     }
    // }

    // private highContrastThemeChanged(checked: boolean): void {
    //     let newTheme: string;
    //     if (checked) {
    //         newTheme = findHighContrastTheme(this.state.theme);
    //     } else {
    //         newTheme = findNonHighContrastTheme(this.state.theme);
    //     }
    //     if (newTheme) {
    //         this.onThemeChange(newTheme);
    //     }
    // }

    private onUserNameColorModeChange = (setting: string, e: React.ChangeEvent<HTMLInputElement>): void => {
        const mode = e.target.value as UserNameColorMode;
        this.setState((prevState) => ({
            ...prevState,
            [setting]: mode,
        }));
        SettingsStore.setValue(setting, null, SettingLevel.DEVICE, mode);
    };

    private renderUserNameColorModeSection() {
        const makeRadio = (setting: string, mode: UserNameColorMode) => (
            // console.log("asdf" + this.state[setting]),
            <StyledRadioButton
                name={setting}
                value={mode}
                checked={this.state[setting] === mode}
                onChange={(e) => this.onUserNameColorModeChange(setting, e)}
            />
        );

        const makeRow = (description: string, setting: string) => (<tr>
            <td>{ description }</td>
            <td>{ makeRadio(setting, UserNameColorMode.Uniform) }</td>
            <td>{ makeRadio(setting, UserNameColorMode.PowerLevel) }</td>
            <td>{ makeRadio(setting, UserNameColorMode.MXID) }</td>
        </tr>);

        return <>
            <div className="mx_SettingsTab_section mx_ThemeChoicePanel_userNameColorModeSection">
                <table className='mx_SettingsTab_settingsTable'>
                    <thead>
                        <tr>
                            <th><span className="mx_SettingsTab_subheading">{ _t("User name color mode") }</span></th>
                            <th>{ _t("Uniform") }</th>
                            <th>{ _t("PowerLevel") }</th>
                            <th>{ _t("MXID") }</th>
                        </tr>
                    </thead>
                    <tbody>
                        { makeRow(_t("For people"), "userNameColorModeDM") }
                        { makeRow(_t("In group chats"), "userNameColorModeGroup") }
                        { makeRow(_t("In public rooms"), "userNameColorModePublic") }
                    </tbody>
                </table>
            </div>
        </>;
    }

    public render(): React.ReactElement<HTMLDivElement> {
        const themeWatcher = new ThemeWatcher();
        const themeInUseSection = <div className="mx_SettingsTab_inlineRadioSelectors">
            <label>
                <StyledRadioButton
                    name="theme_in_use"
                    value={Theme.Light}
                    checked={this.state.themeInUse === Theme.Light}
                    onChange={this.onThemeInUseChange}
                >
                    { _t("Light") }
                </StyledRadioButton>
            </label>
            <label>
                <StyledRadioButton
                    name="theme_in_use"
                    value={Theme.Dark}
                    checked={this.state.themeInUse === Theme.Dark}
                    onChange={this.onThemeInUseChange}
                >
                    { _t("Dark") }
                </StyledRadioButton>
            </label>
            { themeWatcher.isSystemThemeSupported() ?
                <label>
                    <StyledRadioButton
                        name="theme_in_use"
                        value={Theme.System}
                        checked={this.state.themeInUse === Theme.System}
                        onChange={this.onThemeInUseChange}
                    >
                        { _t("System") }
                    </StyledRadioButton>
                </label> : null
            }
        </div>;

        const borderRadiusSection = <div className="mx_SettingsTab_inlineRadioSelectors">
            <label>
                <StyledRadioButton
                    name="border_radius"
                    value={BorderRadius.Default}
                    checked={this.state.borderRadius === BorderRadius.Default}
                    onChange={this.onBorderRadiusChange}
                >
                    { _t("Default") }
                </StyledRadioButton>
            </label>
            <label>
                <StyledRadioButton
                    name="border_radius"
                    value={BorderRadius.Round}
                    checked={this.state.borderRadius === BorderRadius.Round}
                    onChange={this.onBorderRadiusChange}
                >
                    { _t("Round") }
                </StyledRadioButton>
            </label>
            <label>
                <StyledRadioButton
                    name="border_radius"
                    value={BorderRadius.ExtraRound}
                    checked={this.state.borderRadius === BorderRadius.ExtraRound}
                    onChange={this.onBorderRadiusChange}
                >
                    { _t("Extra round") }
                </StyledRadioButton>
            </label>
            <label>
                <StyledRadioButton
                    name="border_radius"
                    value={BorderRadius.Mixed}
                    checked={this.state.borderRadius === BorderRadius.Mixed}
                    onChange={this.onBorderRadiusChange}
                >
                    { _t("Mixed") }
                </StyledRadioButton>
            </label>
        </div>;

        let customThemeForm: JSX.Element;
        if (SettingsStore.getValue("feature_custom_themes")) {
            let messageElement = null;
            if (this.state.customThemeMessage.text) {
                if (this.state.customThemeMessage.isError) {
                    messageElement = <div className="text-error">{this.state.customThemeMessage.text}</div>;
                } else {
                    messageElement = <div className="text-success">{this.state.customThemeMessage.text}</div>;
                }
            }
            customThemeForm = (
                <div className='mx_SettingsTab_section mx_ThemeChoicePanel_addCustomThemeSection'>
                    <span className="mx_SettingsTab_subheading">{ _t("Add custom theme") }</span>
                    <form onSubmit={this.onAddCustomTheme}>
                        <Field
                            label={_t("Custom theme URL")}
                            type="text"
                            id="mx_GeneralUserSettingsTab_customThemeInput"
                            autoComplete="off"
                            onChange={this.onCustomThemeChange}
                            value={this.state.customThemeUrl}
                        />
                        <AccessibleButton
                            onClick={this.onAddCustomTheme}
                            type="submit"
                            kind="primary_sm"
                            disabled={!this.state.customThemeUrl.trim()}
                        >
                            {_t("Add theme")}
                        </AccessibleButton>
                        {messageElement}
                    </form>
                </div>
            );
        }

        const toggle = <AccessibleButton
            kind="link"
            className="mx_ThemeChoicePanel_AdvancedToggle"
            onClick={() => this.setState({ showAdvancedThemeSettings: !this.state.showAdvancedThemeSettings })}
        >
            { this.state.showAdvancedThemeSettings ?
                _t("Hide advanced theme settings") : _t("Show advanced theme settings") }
        </AccessibleButton>;

        let advanced: React.ReactNode;

        if (this.state.showAdvancedThemeSettings) {
            const orderedThemes = getOrderedThemes();

            advanced = <>
                <div className="mx_SettingsTab_section mx_ThemeChoicePanel">
                    <span className="mx_SettingsTab_subheading">{ _t("Light theme") }</span>
                    <div className="mx_ThemeSelectors">
                        <StyledRadioGroup
                            name="light_theme"
                            definitions={orderedThemes.map(t => ({
                                value: t.id,
                                label: t.name,
                                className: "mx_ThemeSelector_" + t.id,
                            }))}
                            onChange={this.onLightThemeChange}
                            value={this.state.lightTheme}
                            outlined
                        />
                    </div>
                </div>
                <div className="mx_SettingsTab_section mx_ThemeChoicePanel">
                    <span className="mx_SettingsTab_subheading">{ _t("Dark theme") }</span>
                    <div className="mx_ThemeSelectors">
                        <StyledRadioGroup
                            name="dark_theme"
                            definitions={orderedThemes.map(t => ({
                                value: t.id,
                                label: t.name,
                                className: "mx_ThemeSelector_" + t.id,
                            }))}
                            onChange={this.onDarkThemeChange}
                            value={this.state.darkTheme}
                            outlined
                        />
                    </div>
                </div>
                { customThemeForm }
                { this.renderUserNameColorModeSection() }
            </>;
        }

        return <>
            <div className="mx_SettingsTab_heading">{ _t("Theme") }</div>
            <div className="mx_SettingsTab_section mx_ThemeChoicePanel_themeInUseSection">
                <span className="mx_SettingsTab_subheading">{ _t("Theme in use") }</span>
                { themeInUseSection }
            </div>
            <div className="mx_SettingsTab_section mx_ThemeChoicePanel_borderRadiusSection">
                <span className="mx_SettingsTab_subheading">{ _t("Corners") }</span>
                { borderRadiusSection }
            </div>
            <div className="mx_SettingsTab_section mx_ThemeChoicePanel_Advanced">
                { toggle }
                { advanced }
            </div>
        </>;

        // // XXX: replace any type here
        // const themes = Object.entries<any>(enumerateThemes())
        //     .map(p => ({ id: p[0], name: p[1] })) // convert pairs to objects for code readability
        //     .filter(p => !isHighContrastTheme(p.id));
        // const builtInThemes = themes.filter(p => !p.id.startsWith("custom-"));
        // const customThemes = themes.filter(p => !builtInThemes.includes(p))
        //     .sort((a, b) => compare(a.name, b.name));
        // const orderedThemes = [...builtInThemes, ...customThemes];
        // return (
        //     <div className="mx_SettingsTab_section mx_ThemeChoicePanel">
        //         <span className="mx_SettingsTab_subheading">{ _t("Theme") }</span>
        //         { systemThemeSection }
        //         <div className="mx_ThemeSelectors">
        //             <StyledRadioGroup
        //                 name="theme"
        //                 definitions={orderedThemes.map(t => ({
        //                     value: t.id,
        //                     label: t.name,
        //                     disabled: this.state.useSystemTheme,
        //                     className: "mx_ThemeSelector_" + t.id,
        //                 }))}
        //                 onChange={this.onThemeChange}
        //                 value={this.apparentSelectedThemeId()}
        //                 outlined
        //             />
        //         </div>
        //         { this.renderHighContrastCheckbox() }
        //         { customThemeForm }
        //     </div>
        // );
    }

    // apparentSelectedThemeId() {
    //     if (this.state.useSystemTheme) {
    //         return undefined;
    //     }
    //     const nonHighContrast = findNonHighContrastTheme(this.state.theme);
    //     return nonHighContrast ? nonHighContrast : this.state.theme;
    // }
}
