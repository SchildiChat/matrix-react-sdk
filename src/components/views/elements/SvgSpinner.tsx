/*
Copyright 2017 New Vector Ltd.

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

import { _t } from "../../../languageHandler";

interface IProps {
    w?: number;
    h?: number;
    className?: string;
}

export default class InlineSpinner extends React.PureComponent<IProps> {
    static defaultProps = {
        w: 32,
        h: 32,
        className: "mx_Spinner_icon",
    };

    render() {
        return (
            // loading-bubbles.svg from https://github.com/jxnblk/loading
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                fill="currentColor"
                width={this.props.w}
                height={this.props.h}
                className={this.props.className}
                aria-label={_t("Loading...")}
                role="progressbar"
            >
                <circle transform="translate(8 0)" cx="0" cy="16" r="0">
                    <animate
                        attributeName="r"
                        values="0; 4; 0; 0"
                        dur="1.2s"
                        repeatCount="indefinite"
                        begin="0"
                        keyTimes="0;0.2;0.7;1"
                        keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8"
                        calcMode="spline"
                    />
                </circle>
                <circle transform="translate(16 0)" cx="0" cy="16" r="0">
                    <animate
                        attributeName="r"
                        values="0; 4; 0; 0"
                        dur="1.2s"
                        repeatCount="indefinite"
                        begin="0.3"
                        keyTimes="0;0.2;0.7;1"
                        keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8"
                        calcMode="spline"
                    />
                </circle>
                <circle transform="translate(24 0)" cx="0" cy="16" r="0">
                    <animate
                        attributeName="r"
                        values="0; 4; 0; 0"
                        dur="1.2s"
                        repeatCount="indefinite"
                        begin="0.6"
                        keyTimes="0;0.2;0.7;1"
                        keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8"
                        calcMode="spline"
                    />
                </circle>
            </svg>
        );
    }
}
