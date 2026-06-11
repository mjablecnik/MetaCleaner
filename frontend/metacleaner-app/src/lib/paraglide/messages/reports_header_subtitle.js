/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Header_SubtitleInputs */

const en_reports_header_subtitle = /** @type {(inputs: Reports_Header_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Log of all cleaning operations`)
};

const cs_reports_header_subtitle = /** @type {(inputs: Reports_Header_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Log všech čistících operací`)
};

/**
* | output |
* | --- |
* | "Log of all cleaning operations" |
*
* @param {Reports_Header_SubtitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_header_subtitle = /** @type {((inputs?: Reports_Header_SubtitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Header_SubtitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_header_subtitle(inputs)
	return cs_reports_header_subtitle(inputs)
});
export { reports_header_subtitle as "reports.header.subtitle" }