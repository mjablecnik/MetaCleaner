/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Reports_Header_Totalreports1Inputs */

const en_reports_header_totalreports1 = /** @type {(inputs: Reports_Header_Totalreports1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} reports total`)
};

const cs_reports_header_totalreports1 = /** @type {(inputs: Reports_Header_Totalreports1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} reportů celkem`)
};

/**
* | output |
* | --- |
* | "{count} reports total" |
*
* @param {Reports_Header_Totalreports1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_header_totalreports1 = /** @type {((inputs: Reports_Header_Totalreports1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Header_Totalreports1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_header_totalreports1(inputs)
	return cs_reports_header_totalreports1(inputs)
});
export { reports_header_totalreports1 as "reports.header.totalReports" }