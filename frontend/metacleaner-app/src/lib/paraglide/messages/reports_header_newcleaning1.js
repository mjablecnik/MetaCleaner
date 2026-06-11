/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Header_Newcleaning1Inputs */

const en_reports_header_newcleaning1 = /** @type {(inputs: Reports_Header_Newcleaning1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New cleaning`)
};

const cs_reports_header_newcleaning1 = /** @type {(inputs: Reports_Header_Newcleaning1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nové čištění`)
};

/**
* | output |
* | --- |
* | "New cleaning" |
*
* @param {Reports_Header_Newcleaning1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_header_newcleaning1 = /** @type {((inputs?: Reports_Header_Newcleaning1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Header_Newcleaning1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_header_newcleaning1(inputs)
	return cs_reports_header_newcleaning1(inputs)
});
export { reports_header_newcleaning1 as "reports.header.newCleaning" }