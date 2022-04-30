/*
Copyright 2016 - 2021 The Matrix.org Foundation C.I.C.

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

import React, { ComponentProps, createRef } from 'react';
import { AllHtmlEntities } from 'html-entities';
import { MatrixEvent } from 'matrix-js-sdk/src/models/event';
import { IPreviewUrlResponse } from 'matrix-js-sdk/src/client';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import { linkifyElement } from '../../../HtmlUtils';
import SettingsStore from "../../../settings/SettingsStore";
import Modal from "../../../Modal";
import * as ImageUtils from "../../../ImageUtils";
import { replaceableComponent } from "../../../utils/replaceableComponent";
import { mediaFromMxc } from "../../../customisations/Media";
import ImageView from '../elements/ImageView';
import { ImageSize, suggestedSize as suggestedVideoSize } from "../../../settings/enums/ImageSize";

interface IProps {
    link: string;
    preview: IPreviewUrlResponse;
    mxEvent: MatrixEvent; // the Event associated with the preview
    youtubeEmbedPlayer?: boolean; // whether youtube embeds are enabled
}

@replaceableComponent("views.rooms.LinkPreviewWidget")
export default class LinkPreviewWidget extends React.Component<IProps> {
    private readonly description = createRef<HTMLDivElement>();
    private image = createRef<HTMLImageElement>();

    componentDidMount() {
        this.sizeWatcher = SettingsStore.watchSetting("Images.size", null, () => {
            this.forceUpdate(); // we don't really have a reliable thing to update, so just update the whole thing
        });

        if (this.description.current) {
            linkifyElement(this.description.current);
        }
    }

    componentDidUpdate() {
        if (this.description.current) {
            linkifyElement(this.description.current);
        }
    }

    private onImageClick = ev => {
        const p = this.props.preview;
        if (ev.button != 0 || ev.metaKey) return;
        ev.preventDefault();

        let src = p["og:image"];
        if (src && src.startsWith("mxc://")) {
            src = mediaFromMxc(src).srcHttp;
        }

        const params: Omit<ComponentProps<typeof ImageView>, "onFinished"> = {
            src: src,
            width: p["og:image:width"],
            height: p["og:image:height"],
            name: p["og:title"] || p["og:description"] || this.props.link,
            fileSize: p["matrix:image:size"],
            link: this.props.link,
        };

        if (this.image.current) {
            const clientRect = this.image.current.getBoundingClientRect();

            params.thumbnailInfo = {
                width: clientRect.width,
                height: clientRect.height,
                positionX: clientRect.x,
                positionY: clientRect.y,
            };
        }

        Modal.createDialog(ImageView, params, "mx_Dialog_lightbox", null, true);
    };

    render() {
        const p = this.props.preview;
        if (!p || Object.keys(p).length === 0) {
            return <div />;
        }

        // FIXME: do we want to factor out all image displaying between this and MImageBody - especially for lightboxing?
        let image = p["og:image"];
        if (!SettingsStore.getValue("showImages")) {
            image = null; // Don't render a button to show the image, just hide it outright
        }
        const imageMaxWidth = 100;
        const imageMaxHeight = 100;
        if (image && image.startsWith("mxc://")) {
            // We deliberately don't want a square here, so use the source HTTP thumbnail function
            image = mediaFromMxc(image).getThumbnailOfSourceHttp(imageMaxWidth, imageMaxHeight, 'scale');
        }

        let thumbHeight = null;
        if (p["og:image:width"] && p["og:image:height"]) {
            thumbHeight = ImageUtils.thumbHeight(
                p["og:image:width"], p["og:image:height"],
                imageMaxWidth, imageMaxHeight,
            );
        }

        let img;
        if (image) {
            img = <div className="mx_LinkPreviewWidget_image" style={{ height: thumbHeight }}>
                <img ref={this.image} style={{ maxWidth: imageMaxWidth, maxHeight: imageMaxHeight }} src={image} onClick={this.onImageClick} />
            </div>;
        }

        // The description includes &-encoded HTML entities, we decode those as React treats the thing as an
        // opaque string. This does not allow any HTML to be injected into the DOM.
        const description = AllHtmlEntities.decode(p["og:description"] || "");

        // Youtube video player embed
        const youtubeRegex = /^https?:\/\/(m[.]|www[.])?(youtube[.]com\/watch[?]v=|youtu[.]be\/)([\w-]+)(\S+)?$/;
        if (this.props.youtubeEmbedPlayer && this.props.link.match(youtubeRegex)) {
            let videoID: string;
            if (this.props.link.includes("watch?v=")) {
                videoID = this.props.link.split("watch?v=")[1].split("&")[0];
            } else if (this.props.link.includes("youtu.be/")) {
                videoID = this.props.link.split("youtu.be/")[1].split("&")[0];
            }

            const restrictedDims = suggestedVideoSize(
                SettingsStore.getValue("Images.size") as ImageSize,
                { w: p["og:image:width"], h: p["og:image:height"] },
            );

            return (
                <div className="mx_LinkPreviewWidget sc_LinkPreviewWidget_youtubeEmbed">
                    <div className="mx_LinkPreviewWidget_image sc_LinkPreviewWidget_youtubePlayer" style={{ flexBasis: restrictedDims.w, maxHeight: restrictedDims.h }}>
                        <LiteYouTubeEmbed
                            id={videoID}
                            title={p["og:title"]}
                            adNetwork={false}
                            noCookie={true}
                            thumbnail={image}
                        />
                    </div>
                    <div className="mx_LinkPreviewWidget_caption sc_LinkPreviewWidget_youtubeCaption">
                        <div className="mx_LinkPreviewWidget_title">
                            <a href={this.props.link} target="_blank" rel="noreferrer noopener">{ p["og:title"] }</a>
                            { p["og:site_name"] && <span className="mx_LinkPreviewWidget_siteName">
                                { (" - " + p["og:site_name"]) }
                            </span> }
                        </div>
                        <div className="mx_LinkPreviewWidget_description" ref={this.description}>
                            { description }
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="mx_LinkPreviewWidget" dir="auto">
                { img }
                <div className="mx_LinkPreviewWidget_caption">
                    <div className="mx_LinkPreviewWidget_title">
                        <a href={this.props.link} target="_blank" rel="noreferrer noopener">{ p["og:title"] }</a>
                        { p["og:site_name"] && <span className="mx_LinkPreviewWidget_siteName">
                            { (" - " + p["og:site_name"]) }
                        </span> }
                    </div>
                    <div className="mx_LinkPreviewWidget_description" ref={this.description}>
                        { description }
                    </div>
                </div>
                { this.props.children }
            </div>
        );
    }
}
