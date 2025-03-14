import { createSlice } from "@reduxjs/toolkit";
//constants
import {
  LAYOUT_TYPES,
  LAYOUT_MODE_TYPES,
  LAYOUT_WIDTH_TYPES,
  TOPBAR_THEME_TYPES,
  LEFT_SIDEBAR_TYPES,
  LEFT_SIDEBAR_THEME_TYPES,
  LEFTBAR_THEME_IMAGES_TYPES
} from "../../Components/constants/layout";

export interface LayoutState {
  layoutTypes: LAYOUT_TYPES.VERTICAL | LAYOUT_TYPES.HORIZONTAL,
  layoutModeTypes: LAYOUT_MODE_TYPES.DARK | LAYOUT_MODE_TYPES.LIGHT,
  layoutWidthTypes: LAYOUT_WIDTH_TYPES.FLUID | LAYOUT_WIDTH_TYPES.BOXED | LAYOUT_WIDTH_TYPES.SCROLLABLE,
  topbarThemeTypes: TOPBAR_THEME_TYPES.LIGHT | TOPBAR_THEME_TYPES.DARK | TOPBAR_THEME_TYPES.COLORED,
  leftSidebarTypes: LEFT_SIDEBAR_TYPES.COMPACT | LEFT_SIDEBAR_TYPES.DEFAULT | LEFT_SIDEBAR_TYPES.ICON,
  leftSideBarThemeTypes: LEFT_SIDEBAR_THEME_TYPES.COLORED | LEFT_SIDEBAR_THEME_TYPES.DARK | LEFT_SIDEBAR_THEME_TYPES.LIGHT | LEFT_SIDEBAR_THEME_TYPES.GREATWHALE | LEFT_SIDEBAR_THEME_TYPES.LADYLIP | LEFT_SIDEBAR_THEME_TYPES.PLUMPLATE | LEFT_SIDEBAR_THEME_TYPES.PLUMPLATE | LEFT_SIDEBAR_THEME_TYPES.WINTER
  leftSidebarImageTypes: LEFTBAR_THEME_IMAGES_TYPES.NONE | LEFTBAR_THEME_IMAGES_TYPES.IMG1 | LEFTBAR_THEME_IMAGES_TYPES.IMG2 | LEFTBAR_THEME_IMAGES_TYPES.IMG3 | LEFTBAR_THEME_IMAGES_TYPES.IMG4
}

export const initialState: LayoutState = {
  layoutTypes: LAYOUT_TYPES.VERTICAL,
  layoutModeTypes: LAYOUT_MODE_TYPES.LIGHT,
  layoutWidthTypes: LAYOUT_WIDTH_TYPES.FLUID,
  topbarThemeTypes: TOPBAR_THEME_TYPES.LIGHT,
  leftSidebarTypes: LEFT_SIDEBAR_TYPES.DEFAULT,
  leftSideBarThemeTypes: LEFT_SIDEBAR_THEME_TYPES.DARK,
  leftSidebarImageTypes: LEFTBAR_THEME_IMAGES_TYPES.NONE
};

const LayoutSlice = createSlice({
  name: 'LayoutSlice',
  initialState,
  reducers: {
    changeLayoutAction(state: any, action: any) {
      state.layoutTypes = action.payload;
    },
    changeLayoutModeAction(state: any, action: any) {
      state.layoutModeTypes = action.payload;
    },
    changeSidebarThemeAction(state: any, action: any) {
      state.leftSideBarThemeTypes = action.payload;
    },
    changeLayoutWidthAction(state: any, action: any) {
      state.layoutWidthTypes = action.payload;
    },
    changeLayoutSidebarAction(state: any, action: any) {
      state.leftSidebarTypes = action.payload;
    },
    changeTopbarThemeAction(state: any, action: any) {
      state.topbarThemeTypes = action.payload;
    },
    changeLeftsidebarViewTypeAction(state: any, action: any) {
      state.leftSidebarViewType = action.payload;
    },
    changeSidebarImageTypeAction(state: any, action: any) {
      state.leftSidebarImageTypes = action.payload;
    },
  }
});

export const {
  changeLayoutAction,
  changeLayoutModeAction,
  changeSidebarThemeAction,
  changeLayoutWidthAction,
  changeTopbarThemeAction,
  changeSidebarImageTypeAction,
  changeLayoutSidebarAction
} = LayoutSlice.actions;

export default LayoutSlice.reducer;