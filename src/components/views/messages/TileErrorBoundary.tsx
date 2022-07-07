/*
Copyright 2020 - 2022 The Matrix.org Foundation C.I.C.

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
import classNames from 'classnames';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";

import { _t } from '../../../languageHandler';
import Modal from '../../../Modal';
import SdkConfig from "../../../SdkConfig";
import BugReportDialog from '../dialogs/BugReportDialog';
import AccessibleButton from '../elements/AccessibleButton';
import SettingsStore from "../../../settings/SettingsStore";
import ViewSource from "../../structures/ViewSource";
import { Layout } from '../../../settings/enums/Layout';

interface IProps {
    mxEvent: MatrixEvent;
    layout: Layout;
}

interface IState {
    error: Error;
}

export default class TileErrorBoundary extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<IState> {
        // Side effects are not permitted here, so we only update the state so
        // that the next render shows an error message.
        return { error };
    }

    private onBugReport = (): void => {
        Modal.createDialog(BugReportDialog, {
            label: 'react-soft-crash-tile',
            error: this.state.error,
        });
    };

    private onViewSource = (): void => {
        Modal.createDialog(ViewSource, {
            mxEvent: this.props.mxEvent,
        }, 'mx_Dialog_viewsource');
    };

    render() {
        if (this.state.error) {
            const { mxEvent } = this.props;
            const classes = {
                mx_EventTile: true,
                mx_EventTile_info: true,
                mx_EventTile_content: true,
                mx_EventTile_tileError: true,
            };

            let submitLogsButton;
            if (SdkConfig.get().bug_report_endpoint_url) {
                submitLogsButton = <AccessibleButton kind="link_inline" onClick={this.onBugReport}>
                    { _t("Submit logs") }
                </AccessibleButton>;
            }

            let viewSourceButton;
            if (mxEvent && SettingsStore.getValue("developerMode")) {
                viewSourceButton = <AccessibleButton onClick={this.onViewSource} kind="link_inline">
                    { _t("View Source") }
                </AccessibleButton>;
            }

            const snippet = (<span>
                { _t("Can't load this message") }
                { mxEvent && ` (${mxEvent.getType()})` }
                { submitLogsButton }
                { viewSourceButton }
            </span>);

            if (this.props.layout === Layout.Bubble) {
                return (<li className={classNames(classes)} data-layout={this.props.layout}>
                    <div className="mx_EventTile_line sc_EventTile_bubbleLine sc_EventTile_bubbleLine_info">
                        <div className="sc_EventTile_bubbleArea sc_EventTile_bubbleArea_center sc_EventTile_bubbleArea_info">
                            <div className="sc_EventTile_bubble sc_EventTile_bubble_info sc_EventTile_bubble_center">
                                { snippet }
                            </div>
                        </div>
                    </div>
                </li>);
            } else {
                return (<li className={classNames(classes)} data-layout={this.props.layout}>
                    <div className="mx_EventTile_line">
                        { snippet }
                    </div>
                </li>);
            }
        }

        return this.props.children;
    }
}
