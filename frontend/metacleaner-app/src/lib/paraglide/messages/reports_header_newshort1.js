/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Header_Newshort1Inputs */

const en_reports_header_newshort1 = /** @type {(inputs: Reports_Header_Newshort1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New`)
};

const cs_reports_header_newshort1 = /** @type {(inputs: Reports_Header_Newshort1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nové`)
};

/**
* | output |
* | --- |
* | "New" |
*
* @param {Reports_Header_Newshort1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_header_newshort1 = /** @type {((inputs?: Reports_Header_Newshort1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Header_Newshort1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_header_newshort1(inputs)
	return cs_reports_header_newshort1(inputs)
});
export { reports_header_newshort1 as "reports.header.newShort" }