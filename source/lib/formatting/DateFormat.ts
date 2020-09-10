import moment from "moment";

import { IFormatMap } from "../../types";
/**
 * Map of tiddlywiki date format to momentjs
 * date format.
 *
 * https://tiddlywiki.com/static/DateFormat.html
 * https://momentjs.com/docs/#/displaying/
 */
const DATE_FORMAT_MAP: IFormatMap = {
    DDD: "dddd",
    ddd: "ddd",
    DD: "D",
    "0DD": "DD",
    WW: "W",
    "0WW": "WW",
    MMM: "MMMM",
    mmm: "MMM",
    MM: "M",
    "0MM": "MM",
    YYYY: "YYYY",
    YY: "YY",
    wYYYY: "",
    wYY: "",
    hh: "H",
    "0hh": "HH",
    hh12: "h",
    "0hh12": "hh",
    mm: "m",
    "0mm": "mm",
    ss: "s",
    "0ss": "ss",
    XXX: "",
    "0XXX": "",
    am: "a",
    pm: "a",
    AM: "A",
    PM: "A",
    TZD: "",
    "[UTC]": "",
};

/**
 * Apply the time to any possible DateFormat parts
 * of a bit of text
 *
 * @param text string
 */
export default function dateformat(text: string) {
    const tdKeys = Object.keys(DATE_FORMAT_MAP);

    const now = moment();
    for (let key of tdKeys) {
        const D = "{[D|" + key + "]}";

        const idx = text.search(D);
        if (idx > -1) {
            const momentFmtString = DATE_FORMAT_MAP[key];
            let momentFormattedSubstring = "";
            if (momentFmtString !== "") {
                momentFormattedSubstring = now.format(momentFmtString);
            }
            text = text.replace(D, momentFormattedSubstring);
        }
    }
    return text;
}
