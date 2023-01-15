/*
Copyright 2017 Travis Ralston
Copyright 2019 New Vector Ltd.
Copyright 2019 - 2022 The Matrix.org Foundation C.I.C.

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

import { MatrixClientPeg } from "../../MatrixClientPeg";
import { SettingLevel } from "../SettingLevel";
import { CallbackFn, WatchManager } from "../WatchManager";
import { Theme } from "../enums/Theme";
import AbstractLocalStorageSettingsHandler from "./AbstractLocalStorageSettingsHandler";

/**
 * Gets and sets settings at the "device" level for the current device.
 * This handler does not make use of the roomId parameter. This handler
 * will special-case features to support legacy settings.
 */
export default class DeviceSettingsHandler extends AbstractLocalStorageSettingsHandler {
    /**
     * Creates a new device settings handler
     * @param {string[]} featureNames The names of known features.
     * @param {WatchManager} watchers The watch manager to notify updates to
     */
    constructor(private featureNames: string[], public readonly watchers: WatchManager) {
        super();
    }

    public getValue(settingName: string, roomId: string): any {
        if (this.featureNames.includes(settingName)) {
            return this.readFeature(settingName);
        }

        // Special case notifications
        if (settingName === "notificationsEnabled") {
            return this.getBoolean("notifications_enabled");
        } else if (settingName === "notificationBodyEnabled") {
            return this.getBoolean("notifications_body_enabled");
        } else if (settingName === "audioNotificationsEnabled") {
            return this.getBoolean("audio_notifications_enabled");
        }

        // Special case for old use_system_theme and theme setting
        if (settingName === "theme_in_use") {
            const settings = this.getSettings() || {};

            if (settings["use_system_theme"]) return Theme.System;

            return settings[settingName];
        }

        // Special cases for old theme setting
        if (settingName === "light_theme" || settingName === "dark_theme") {
            const settings = this.getSettings() || {};

            const theme = settings["theme"];
            if (theme && !settings["use_system_theme"]) {
                return theme;
            }

            return settings[settingName];
        }

        const settings = this.getSettings() || {};
        return settings[settingName];
    }

    public setValue(settingName: string, roomId: string, newValue: any): Promise<void> {
        if (this.featureNames.includes(settingName)) {
            this.writeFeature(settingName, newValue);
            return Promise.resolve();
        }

        // Special case notifications
        if (settingName === "notificationsEnabled") {
            this.setBoolean("notifications_enabled", newValue);
            this.watchers.notifyUpdate(settingName, null, SettingLevel.DEVICE, newValue);
            return Promise.resolve();
        } else if (settingName === "notificationBodyEnabled") {
            this.setBoolean("notifications_body_enabled", newValue);
            this.watchers.notifyUpdate(settingName, null, SettingLevel.DEVICE, newValue);
            return Promise.resolve();
        } else if (settingName === "audioNotificationsEnabled") {
            this.setBoolean("audio_notifications_enabled", newValue);
            this.watchers.notifyUpdate(settingName, null, SettingLevel.DEVICE, newValue);
            return Promise.resolve();
        }

        // Special case for old useBubbleLayout and useIRCLayout setting
        if (settingName === "layout") {
            const settings = this.getSettings() || {};

            delete settings["useBubbleLayout"];
            delete settings["useIRCLayout"];
            settings["layout"] = newValue;
            this.setObject("mx_local_settings", settings);

            this.watchers.notifyUpdate(settingName, null, SettingLevel.DEVICE, newValue);
            return Promise.resolve();
        }

        // Special case for old use_system_theme setting
        if (settingName === "theme_in_use") {
            const settings = this.getSettings() || {};

            if (settings["theme"] && !settings["use_system_theme"]) {
                settings["dark_theme"] = settings["theme"];
                settings["light_theme"] = settings["theme"];
            }

            delete settings["use_system_theme"];
            delete settings["theme"];
            settings["theme_in_use"] = newValue;
            localStorage.setItem("mx_local_settings", JSON.stringify(settings));

            this.watchers.notifyUpdate("theme_in_use", null, SettingLevel.DEVICE, settings["theme_in_use"]);
            this.watchers.notifyUpdate("light_theme", null, SettingLevel.DEVICE, settings["light_theme"]);
            this.watchers.notifyUpdate("dark_theme", null, SettingLevel.DEVICE, settings["dark_theme"]);
            return Promise.resolve();
        }

        // Special cases for old theme setting
        if (settingName === "light_theme" || settingName === "dark_theme") {
            const settings = this.getSettings() || {};

            if (settings["theme"] && !settings["use_system_theme"]) {
                if (settingName === "light_theme") settings["dark_theme"] = settings["theme"];
                if (settingName === "dark_theme") settings["light_theme"] = settings["theme"];
            }

            delete settings["use_system_theme"];
            delete settings["theme"];
            settings[settingName] = newValue;
            localStorage.setItem("mx_local_settings", JSON.stringify(settings));

            this.watchers.notifyUpdate("theme_in_use", null, SettingLevel.DEVICE, settings["theme_in_use"]);
            this.watchers.notifyUpdate("light_theme", null, SettingLevel.DEVICE, settings["light_theme"]);
            this.watchers.notifyUpdate("dark_theme", null, SettingLevel.DEVICE, settings["dark_theme"]);
            return Promise.resolve();
        }

        const settings = this.getSettings() || {};
        settings[settingName] = newValue;
        this.setObject("mx_local_settings", settings);
        this.watchers.notifyUpdate(settingName, null, SettingLevel.DEVICE, newValue);

        return Promise.resolve();
    }

    public canSetValue(settingName: string, roomId: string): boolean {
        return true; // It's their device, so they should be able to
    }

    public watchSetting(settingName: string, roomId: string, cb: CallbackFn) {
        this.watchers.watchSetting(settingName, roomId, cb);
    }

    public unwatchSetting(cb: CallbackFn) {
        this.watchers.unwatchSetting(cb);
    }

    private getSettings(): any {
        // TODO: [TS] Type return
        return this.getObject("mx_local_settings");
    }

    // Note: features intentionally don't use the same key as settings to avoid conflicts
    // and to be backwards compatible.

    // public for access to migrations - not exposed from the SettingsHandler interface
    public readFeature(featureName: string): boolean | null {
        if (MatrixClientPeg.get() && MatrixClientPeg.get().isGuest()) {
            // Guests should not have any labs features enabled.
            return false;
        }

        // XXX: This turns they key names into `mx_labs_feature_feature_x` (double feature).
        // This is because all feature names start with `feature_` as a matter of policy.
        // Oh well.
        return this.getBoolean("mx_labs_feature_" + featureName);
    }

    private writeFeature(featureName: string, enabled: boolean | null) {
        this.setBoolean("mx_labs_feature_" + featureName, enabled);
        this.watchers.notifyUpdate(featureName, null, SettingLevel.DEVICE, enabled);
    }
}
