/*
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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

import SettingsStore from '../SettingsStore';
import dis from '../../dispatcher/dispatcher';
import { Action } from '../../dispatcher/actions';
import ThemeController from "../controllers/ThemeController";
import { setTheme, getCustomTheme } from "../../theme";
import { ActionPayload } from '../../dispatcher/payloads';
import { Theme } from '../enums/Theme';

export default class ThemeWatcher {
    private lightThemeWatchRef: string;
    private darkThemeWatchRef: string;
    private themeInUseWatchRef: string;
    private dispatcherRef: string;

    private preferDark: MediaQueryList;
    private preferLight: MediaQueryList;
    private preferHighContrast: MediaQueryList;

    private static currentTheme: string;

    constructor() {
        this.lightThemeWatchRef = null;
        this.darkThemeWatchRef = null;
        this.themeInUseWatchRef = null;
        this.dispatcherRef = null;

        // we have both here as each may either match or not match, so by having both
        // we can get the tristate of dark/light/unsupported
        this.preferDark = (<any>global).matchMedia("(prefers-color-scheme: dark)");
        this.preferLight = (<any>global).matchMedia("(prefers-color-scheme: light)");
        this.preferHighContrast = (<any>global).matchMedia("(prefers-contrast: more)");

        ThemeWatcher.currentTheme = this.getEffectiveTheme();
    }

    public start() {
        this.lightThemeWatchRef = SettingsStore.watchSetting("light_theme", null, this.onChange);
        this.darkThemeWatchRef = SettingsStore.watchSetting("dark_theme", null, this.onChange);
        this.themeInUseWatchRef = SettingsStore.watchSetting("theme_in_use", null, this.onChange);
        if (this.preferDark.addEventListener) {
            this.preferDark.addEventListener('change', this.onChange);
            this.preferLight.addEventListener('change', this.onChange);
            this.preferHighContrast.addEventListener('change', this.onChange);
        }
        this.dispatcherRef = dis.register(this.onAction);
    }

    public stop() {
        if (this.preferDark.addEventListener) {
            this.preferDark.removeEventListener('change', this.onChange);
            this.preferLight.removeEventListener('change', this.onChange);
            this.preferHighContrast.removeEventListener('change', this.onChange);
        }
        SettingsStore.unwatchSetting(this.themeInUseWatchRef);
        SettingsStore.unwatchSetting(this.darkThemeWatchRef);
        SettingsStore.unwatchSetting(this.lightThemeWatchRef);
        dis.unregister(this.dispatcherRef);
    }

    private onChange = () => {
        this.recheck();
    };

    private onAction = (payload: ActionPayload) => {
        if (payload.action === Action.RecheckTheme) {
            // XXX forceTheme
            this.recheck(payload.forceTheme);
        }
    };

    // XXX: forceTheme param added here as local echo appears to be unreliable
    // https://github.com/vector-im/element-web/issues/11443
    public recheck(forceTheme?: string) {
        const oldTheme = ThemeWatcher.currentTheme;
        ThemeWatcher.currentTheme = forceTheme === undefined ? this.getEffectiveTheme() : forceTheme;
        if (oldTheme !== ThemeWatcher.currentTheme) {
            setTheme(ThemeWatcher.currentTheme);
        }
    }

    public getEffectiveTheme(): string {
        let themeToUse = Theme.Light;

        if (!ThemeController.isLogin) {
            themeToUse = SettingsStore.getValue('theme_in_use');

            if (themeToUse === Theme.System) {
                if (this.preferDark.matches) themeToUse = Theme.Dark;
                if (this.preferLight.matches) themeToUse = Theme.Light;
            }
        }

        if (themeToUse === Theme.Dark) {
            return SettingsStore.getValue('dark_theme');
        } else {
            return SettingsStore.getValue('light_theme');
        }
    }

    public isSystemThemeSupported() {
        return this.preferDark.matches || this.preferLight.matches;
    }

    public static getCurrentTheme(): string {
        return ThemeWatcher.currentTheme;
    }

    /**
     * For widgets/stickers/... who only support light/dark
     * @returns "light" or "dark"
    */
    public static getCurrentThemeSimplified(): string {
        let theme = ThemeWatcher.currentTheme;
        if (theme.startsWith("custom-")) {
            const customTheme = getCustomTheme(theme.substr(7));
            theme = customTheme.is_dark ? "dark" : "light";
        }

        // only allow light/dark through, defaulting to dark as that was previously the only state
        // accounts for legacy-light/legacy-dark themes too
        if (theme.includes("light")) {
            theme = "light";
        } else {
            theme = "dark";
        }

        return theme;
    }
}
