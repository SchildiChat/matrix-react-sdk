<!--
Copyright 2024 Suguru Hirahara

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# `_sc` folder for customization

When it comes to styling, we could just import a custom CSS file after the last existing `@import` on `res/css/_components.pcss` and put anything such as custom CSS declarations and variables in it to let them override the inherited values.

The obvious merit of doing so is that it will remove the burden of applying customization directly on the upstream CSS codebase fixing conflicts. Separating customized styles from the upstream codebase, which has been prone to visual regressions, should also greatly reduce the manpower to rebase, without being worried about introducing new visual regressions. Doing so will also make it easier to fix the regressions on our codebase which the upstream project has not fixed yet.

Even if the properties are styled with `!important` by the upstream to cover regressions, they can be overridden by ones with `!important` on the CSS loaded later than that.

The way in which the upstream project generates concatenated CSS files has been very stable (essentially same since at least 2018. See: https://github.com/matrix-org/matrix-react-sdk/commits/develop/res/css/rethemendex.sh), so we should be able to depend on the current way how it works for a reasonable time.

**Warning: running `rethemendex` breaks cascading!** Manual editing is required for now.
