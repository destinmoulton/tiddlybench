import _ from "lodash";
import { IFormatMap, ITabInfo } from "../../types";
const TAB_FORMAT_MAP: IFormatMap = {
    SOURCE_LINK: "SOURCE_LINK",
};
/**
 * Tab format options.
 *
 * Without a tab object defined, it replaces
 * all the tab {[T|TAG]}'s with a blank string
 */
export default function tabformat(
    inputString: string,
    tabInfo: ITabInfo | undefined
) {
    const formatKeys = Object.keys(TAB_FORMAT_MAP);

    let newString = inputString;
    for (let key of formatKeys) {
        const T = new RegExp(_.escapeRegExp("{[T|" + key + "]}"), "g");

        const idx = newString.search(T);
        if (idx > -1) {
            // If there is no tab, then replace the
            // tab T tag with a blank string
            let replacement = "";
            if (tabInfo) {
                switch (key) {
                    case "SOURCE_LINK": {
                        if (tabInfo.url && tabInfo.url !== "") {
                            if (tabInfo.title && tabInfo.title !== "") {
                                replacement =
                                    "[[" +
                                    tabInfo.title +
                                    "|" +
                                    tabInfo.url +
                                    "]]";
                            } else {
                                replacement = "[[Source|" + tabInfo.url + "]]";
                            }
                        } else {
                            if (tabInfo.title && tabInfo.title !== "") {
                                replacement = tabInfo.title;
                            } else {
                                replacement = "Unknown Source";
                            }
                        }
                        break;
                    }
                }
            }
            newString = newString.replaceAll(T, replacement);
        }
    }
    return newString;
}
