import { changeBodyAttribute, manageBodyClass } from './utils';

import {
    changeLayoutModeAction,
    changeTopbarThemeAction,
    changeSidebarThemeAction,
    changeSidebarImageTypeAction,
    changeLayoutAction,
    changeLayoutSidebarAction,
    changeLayoutWidthAction
} from "./reducer";

/**
 * Changes the layout mode
 * @param {*} param0
 */
export const changeLayout = (layout: any) => async (dispatch: any) => {
    try {
        switch (layout) {
            case "horizontal":
                document.body.removeAttribute("data-sidebar");
                document.body.removeAttribute("data-sidebar-image");
                document.body.removeAttribute("data-sidebar-size");
                break;

            case "vertical":
                // dispatch(changeTopbarThemeAction('light'));
                break;
        }
        changeBodyAttribute("data-layout", layout);
        dispatch(changeLayoutAction(layout));
    } catch (error) { }
};

/**
 * Changes the layout mode
 * @param {*} param0
 */
export const changeLayoutMode = (layoutMode: any) => async (dispatch: any) => {
    try {
        changeBodyAttribute("data-layout-mode", layoutMode)
        dispatch(changeLayoutModeAction(layoutMode));

    } catch (error) { }
};

/**
 * Changes the layout width
 * @param {*} param0
 */
export const changeLayoutWidth = (layoutWidth: any) => async (dispatch: any) => {

    try {
        if (layoutWidth === "boxed") {
            changeBodyAttribute("data-sidebar-size", "")
            changeBodyAttribute("data-keep-enlarged", "true")
            manageBodyClass("vertical-collpsed", "add")

            changeBodyAttribute("data-layout-size", layoutWidth)
            changeBodyAttribute("data-layout-scrollable", false)
        } else if (layoutWidth === "scrollable") {
            changeBodyAttribute("data-sidebar-size", "")
            manageBodyClass("vertical-collpsed", "remove")
            manageBodyClass("sidebar-enable", "remove")

            changeBodyAttribute("data-layout-scrollable", true)
        } else {
            changeBodyAttribute("data-sidebar-size", "")
            manageBodyClass("vertical-collpsed", "remove")
            manageBodyClass("sidebar-enable", "remove")

            changeBodyAttribute("data-layout-size", layoutWidth)
            changeBodyAttribute("data-layout-scrollable", false)
        }

        dispatch(changeLayoutWidthAction(layoutWidth));
    } catch (error) { }
};

/**
 * Changes the layout mode
 * @param {*} param0
 */
export const changeTopbarTheme = (topbarTheme: any) => async (dispatch: any) => {
    try {
        changeBodyAttribute("data-topbar", topbarTheme)
        dispatch(changeTopbarThemeAction(topbarTheme))
    } catch (error) { }
};

/**
 * Changes the layout mode
 * @param {*} param0
 */
export const changeLeftSidebarTheme = (sidebarTheme: any) => async (dispatch: any) => {
    try {
        changeBodyAttribute("data-sidebar", sidebarTheme);
        dispatch(changeSidebarThemeAction(sidebarTheme));
    } catch (error) {
        // console.log(error);
    }
};

/**
 * Changes the sidebar mode
 * @param {*} param0
 */
export const changeLeftSidebarType = (sidebarType: any) => async (dispatch: any) => {
    try {
        switch (sidebarType) {
            case "small":
                changeBodyAttribute("data-sidebar-size", "small")
                manageBodyClass("sidebar-enable", "remove")
                manageBodyClass("vertical-collpsed", "remove")
                break
            case "compact":
                changeBodyAttribute("data-sidebar-size", "small")
                manageBodyClass("sidebar-enable", "remove")
                manageBodyClass("vertical-collpsed", "remove")
                break
            case "icon":
                changeBodyAttribute("data-sidebar-size", "")
                changeBodyAttribute("data-keep-enlarged", "true")
                manageBodyClass("vertical-collpsed", "add")
                break
            case "condensed":

                manageBodyClass("sidebar-enable", "add")
                if (window.screen.width >= 992) {
                    manageBodyClass("vertical-collpsed", "remove")
                    manageBodyClass("sidebar-enable", "remove")
                    manageBodyClass("vertical-collpsed", "add")
                    manageBodyClass("sidebar-enable", "add")
                } else {
                    manageBodyClass("sidebar-enable", "add")
                    manageBodyClass("vertical-collpsed", "add")
                }
                break
            default:
                changeBodyAttribute("data-sidebar-size", "")
                manageBodyClass("vertical-collpsed", "remove")
                manageBodyClass("sidebar-enable", "remove")
                break
        }
        dispatch(changeLayoutSidebarAction(sidebarType))
    } catch (error) { }
};

/**
 * Changes the sidebar images
 * @param {*} param0
 */
export const changeSidebarImageType = (leftsidebarImagetype: any) => async (dispatch: any) => {
    try {
        changeBodyAttribute("data-sidebar-image", leftsidebarImagetype);
        dispatch(changeSidebarImageTypeAction(leftsidebarImagetype));
    } catch (error) {
        // console.log(error);
    }
};
