#!/bin/bash

shopt -s globstar

mydir="$(dirname "$(realpath "$0")")"

# Require clean git state
uncommitted=`git status --porcelain`
if [ ! -z "$uncommitted" ]; then
    echo "Uncommitted changes are present, please commit first!"
    exit 1
fi

pushd "$mydir" > /dev/null

M_ACCENT="#8BC34A"
M_ACCENT_DEC="139, 195, 74"
M_ACCENT_DARK="#33691E"
M_ACCENT_LIGHT="#DCEDC8"
M_LINK="#368bd6"

replace_colors() {
    local f="$1"
    if [[ "$f" =~ "dark" ]]; then
        BG_ACCENT="$M_ACCENT_DARK"
        CODEBLOCK_BACKGROUND_COLOR="#121212"
        PILL_COLOR="rgba(255, 255, 255, 0.12)"
    else
        BG_ACCENT="$M_ACCENT_LIGHT"
        CODEBLOCK_BACKGROUND_COLOR="#00000010"
        PILL_COLOR="rgba(0, 0, 0, 0.1)" # default
    fi
    # Neutral colors
    sed -i 's|#15171b|#212121|gi' "$f"
    sed -i 's|#15191E|#212121|gi' "$f"
    sed -i 's|#2e2f32|#212121|gi' "$f"
    sed -i 's|#232f32|#212121|gi' "$f"
    sed -i 's|#27303a|#212121|gi' "$f"
    sed -i 's|#17191C|#212121|gi' "$f"
    sed -i 's|#181b21|#303030|gi' "$f"
    sed -i 's|#1A1D23|#303030|gi' "$f"
    sed -i 's|#20252B|#303030|gi' "$f"
    sed -i 's|#20252c|#303030|gi' "$f"
    sed -i 's|#21262c|#383838|gi' "$f" # selection/hover color
    sed -i 's|#238cf5|#303030|gi' "$f"
    sed -i 's|#25271F|#303030|gi' "$f"
    sed -i 's|#272c35|#303030|gi' "$f"
    sed -i 's|#2a3039|#303030|gi' "$f"
    sed -i 's|#343a46|#424242|gi' "$f"
    sed -i 's|#3c4556|#424242|gi' "$f"
    sed -i 's|#3d3b39|#424242|gi' "$f"
    sed -i 's|#45474a|#424242|gi' "$f"
    sed -i 's|#454545|#424242|gi' "$f"
    sed -i 's|#2e3649|#424242|gi' "$f"
    sed -i 's|#4e5054|#424242|gi' "$f"
    sed -i 's|#394049|#424242|gi' "$f"
    sed -i 's|#3e444c|#424242|gi' "$f"
    sed -i 's|#61708b|#616161|gi' "$f"
    sed -i 's|#616b7f|#616161|gi' "$f"
    sed -i 's|#5c6470|#616161|gi' "$f"
    sed -i 's|#737D8C|#757575|gi' "$f"
    sed -i 's|#6F7882|#757575|gi' "$f"
    sed -i 's|#91A1C0|#757575|gi' "$f" # icon in button color
    sed -i 's|#8D99A5|#808080|gi' "$f"
    sed -i 's|#8E99A4|#808080|gi' "$f" # maybe use #9e9e9e instead
    sed -i 's|#8D97A5|#808080|gi' "$f"
    sed -i 's|#a2a2a2|#9e9e9e|gi' "$f"
    sed -i 's|#9fa9ba|#aaaaaa|gi' "$f" # maybe use #9e9e9e instead
    sed -i 's|#acacac|#aaaaaa|gi' "$f" # maybe use #9e9e9e instead
    sed -i 's|#B9BEC6|#b3b3b3|gi' "$f" # maybe use #bdbdbd instead
    sed -i 's|#a1b2d1|#b3b3b3|gi' "$f"
    sed -i 's|#A9B2BC|#b3b3b3|gi' "$f"
    sed -i 's|#C1C6CD|#bdbdbd|gi' "$f"
    sed -i 's|#c1c9d6|#bdbdbd|gi' "$f"
    sed -i 's|#c8c8cd|#cccccc|gi' "$f" # maybe use #bdbdbd instead
    # sed -i 's|#dddddd|#e0e0e0|gi' "$f" # really?
    sed -i 's|#e7e7e7|#e0e0e0|gi' "$f"
    sed -i 's|#e3e8f0|#e0e0e0|gi' "$f"
    sed -i 's|#e9e9e9|#e0e0e0|gi' "$f"
    sed -i 's|#e9edf1|#e0e0e0|gi' "$f"
    sed -i 's|#e8eef5|#e0e0e0|gi' "$f"
    sed -i 's|#edf3ff|#eeeeee|gi' "$f"
    sed -i 's|#f4f6fa|#f5f5f5|gi' "$f"
    sed -i 's|#f6f7f8|#f5f5f5|gi' "$f"
    sed -i 's|#f2f5f8|#f5f5f5|gi' "$f"
    sed -i 's|#f3f8fd|#fafafa|gi' "$f"
    sed -i 's|rgba(33, 38, 34,|rgba(48, 48, 48,|gi' "$f"
    sed -i 's|rgba(33, 38, 44,|rgba(48, 48, 48,|gi' "$f"
    sed -i 's|rgba(34, 38, 46,|rgba(48, 48, 48,|gi' "$f"
    sed -i 's|rgba(38, 39, 43,|rgba(48, 48, 48,|gi' "$f"
    sed -i 's|rgba(46, 48, 51,|rgba(48, 48, 48,|gi' "$f"
    sed -i 's|rgba(92, 100, 112,|rgba(97, 97, 97,|gi' "$f"
    sed -i 's|rgba(141, 151, 165,|rgba(144, 144, 144,|gi' "$f"
    sed -i 's|rgba(242, 245, 248,|rgba(248, 248, 248,|gi' "$f"

    sed -i "s|\\(\$event-highlight-bg-color: \\).*;|\\1transparent;|gi" "$f"
    sed -i "s|\\(\$preview-widget-bar-color: \\).*;|\\1#bdbdbd;|gi" "$f"
    sed -i "s|\\(\$blockquote-bar-color: \\).*;|\\1#bdbdbd;|gi" "$f"
    sed -i "s|\\(\$other-user-pill-bg-color: \\).*;|\\1$PILL_COLOR;|gi" "$f"
    sed -i "s|\\(\$rte-room-pill-color: \\).*;|\\1$PILL_COLOR;|gi" "$f"

    sed -i "s|\\(\$codeblock-background-color: \\).*;|\\1$CODEBLOCK_BACKGROUND_COLOR;|gi" "$f"

    # Accent colors
    sed -i "s|#368bd6|$M_ACCENT|gi" "$f"
    sed -i "s|#ac3ba8|$M_ACCENT|gi" "$f"
    sed -i "s|#0DBD8B|$M_ACCENT|gi" "$f"
    sed -i "s|#e64f7a|$M_ACCENT|gi" "$f"
    sed -i "s|#ff812d|$M_ACCENT|gi" "$f"
    sed -i "s|#2dc2c5|$M_ACCENT|gi" "$f"
    sed -i "s|#5c56f5|$M_ACCENT|gi" "$f"
    sed -i "s|#74d12c|$M_ACCENT|gi" "$f"
    sed -i "s|#76CFA6|$M_ACCENT|gi" "$f"
    sed -i "s|#03b381|$M_ACCENT|gi" "$f"
    sed -i "s|rgba(3, 179, 129,|rgba($M_ACCENT_DEC,|gi" "$f"
    sed -i "s|\\(\$accent-alt: \\).*;|\\1$M_LINK;|gi" "$f"
    #sed -i "s|\\(\$accent-darker: \\).*;|\\1$M_ACCENT_DARK;|gi" "$f"
    sed -i "s|\\(\$roomtile-default-badge-bg-color: \\).*;|\\1\$accent;|gi" "$f"
    #sed -i "s|\\(\$input-focused-border-color: \\).*;|\\1\$accent;|gi" "$f" # not existing anymore, need replacement?
    sed -i "s|\\(\$reaction-row-button-selected-bg-color: \\).*;|\\1$BG_ACCENT;|gi" "$f"
    sed -i "s|\\(\$reaction-row-button-selected-bg-color: \\).*;|\\1$BG_ACCENT;|gi" "$f"
}

replace_colors res/themes/dark/css/_dark.scss
replace_colors res/themes/light/css/_light.scss
replace_colors res/themes/legacy-light/css/_legacy-light.scss
replace_colors res/themes/legacy-dark/css/_legacy-dark.scss
for f in res/**/*.svg; do
    replace_colors "$f"
done

popd > /dev/null

# see: https://devops.stackexchange.com/a/5443
git add -A
git diff-index --quiet HEAD || git commit -m "Automatic theme update"
