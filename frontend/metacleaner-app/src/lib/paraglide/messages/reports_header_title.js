/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Header_TitleInputs */

const en_reports_header_title = /** @type {(inputs: Reports_Header_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Report history`)
};

const cs_reports_header_title = /** @type {(inputs: Reports_Header_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Historie reportů`)
};

/**
* | output |
* | --- |
* | "Report history" |
*
* @param {Reports_Header_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_header_title = /** @type {((inputs?: Reports_Header_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Header_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_header_title(inputs)
	return cs_reports_header_title(inputs)
});
export { reports_header_title as "reports.header.title" }