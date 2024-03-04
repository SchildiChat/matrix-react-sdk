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

For customization, import a custom CSS file on `res/css/_sc/_customization.pcss` and put anything such as custom CSS declarations and variables in it to let them override the values inherited from the upstream.

Please mind where to import a new CSS file. **Never sort the files alphabetically as it breaks how styles cascade.**
