/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ date: NonNullable<unknown>, files: NonNullable<unknown>, fields: NonNullable<unknown> }} Report_Header_Generateddesc1Inputs */

const en_report_header_generateddesc1 = /** @type {(inputs: Report_Header_Generateddesc1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.date} · ${i?.files} files · ${i?.fields} fields removed`)
};

const cs_report_header_generateddesc1 = /** @type {(inputs: Report_Header_Generateddesc1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.date} · ${i?.files} souborů · ${i?.fields} polí odstraněno`)
};

/**
* | output |
* | --- |
* | "{date} · {files} files · {fields} fields removed" |
*
* @param {Report_Header_Generateddesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_header_generateddesc1 = /** @type {((inputs: Report_Header_Generateddesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Header_Generateddesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_header_generateddesc1(inputs)
	return cs_report_header_generateddesc1(inputs)
});
export { report_header_generateddesc1 as "report.header.generatedDesc" }