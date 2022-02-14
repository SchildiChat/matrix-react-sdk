/*
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

import { _t } from "../languageHandler";
import dis from '../dispatcher/dispatcher';
import GenericToast from "../components/views/toasts/GenericToast";
import ToastStore from "../stores/ToastStore";
import PlatformPeg from "../PlatformPeg";
import SdkConfig from "../SdkConfig";
import SettingsStore from "../settings/SettingsStore";
import { SettingLevel } from "../settings/SettingLevel";

const onAccept = () => {
    dis.dispatch({
        action: 'view_room',
        room_alias: "#web-announcements:schildi.chat",
    });

    // Now the room should be joined, no need to show it again
    SettingsStore.setValue("scShowUpdateAnnouncementRoomToast", null, SettingLevel.DEVICE, false);

    // ToDo: Figure out a way to check if the account has already joined the room
    hideToast();
};

const onReject = () => {
    // Don't show again
    SettingsStore.setValue("scShowUpdateAnnouncementRoomToast", null, SettingLevel.DEVICE, false);

    hideToast();
};

const TOAST_KEY = "scupdateannouncementroom";

export const showToast = () => {
    PlatformPeg.get().canSelfUpdate().then((b) => {
        if (b) return;

        ToastStore.sharedInstance().addOrReplaceToast({
            key: TOAST_KEY,
            title: _t("Update notifications"),
            props: {
                description: _t(
                    "Do you want to join a room notifying you about new releases? " +
                    "This is especially useful if your platform doesn't support " +
                    "automatic updates for SchildiChat (e.g. Windows and macOS).",
                ),
                acceptLabel: _t("Show preview"),
                onAccept,
                rejectLabel: _t("No"),
                onReject,
            },
            component: GenericToast,
            priority: 20,
        });
    }).catch((e) => {
        console.error("Error getting vector version: ", e);
    });
};

export const hideToast = () => {
    ToastStore.sharedInstance().dismissToast(TOAST_KEY);
};
