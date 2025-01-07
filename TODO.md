# TODO Project Plan

TODO plan za Projekt R

## Features

-   **Variable thickness lines** (+)

    -   https://mattdesl.svbtle.com/drawing-lines-is-hard
    -   https://blog.scottlogic.com/2019/11/18/drawing-lines-with-webgl.html

-   **Bugs**

    -   Holding middle click and left click with pen tool and moving mouse around (-)
    -   Instantiate the tools once and then reuse them to keep their settings (+)
    -   When changing options trigger rerender of current tool maybe... (OnToolOptionChange function for each tool) (+)
    -   When changing colours trigger rerender of current tool (OnColourSelectionChange) (+)
    -   Triangular Colour Picker wheel not changing on initial state (+)

-   **Draw basic shapes** (+)

    -   circle/elipse
    -   square/rectangle
    -   change fill style option (filled/outline)
    -   manipulate shapes with hotpoints
    -   rotate shapes (-)
    -   move shapes (-)

-   **Color picker Tool** (+)

    -   Get canvas pixel colour

-   **CheckerMark Pattern On Canvas** (+)

    -   Show checkermark pattern on alpha 0 on canvas

-   **Resize options** (+)

    -   resize image
    -   resize canvas

-   **Image Tools** (-)

    -   Crop (+)
    -   Copy
    -   Cut
    -   Paste

-   **Brush Tool** (+)

    -   Brush size option

-   **Undo/Redo** (-)

    -   Detect change with minimum bounding box
    -   Compress changes
    -   Undo / Redo changes
    -   Visual changes stack UI
    -   Command Pattern

-   **Select Tool** (-)

    -   Rectangle Select (+)
    -   Lasso Select

-   **Layers** (-)

    -   Adding/Removing Layers
    -   Blending Layers
    -   Layer UI

-   **Eraser Tool** (+)

    -   Eraser brush size option

-   **Text** (-)

    -   Find library for drawing text

-   **BrushCursor** (+)

    -   circular cursor that shows which pixels will change
    -   for pen and eraser
