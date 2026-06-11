/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Meta_TitleInputs */

const en_report_meta_title = /** @type {(inputs: Report_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Detailed Cleaning Report`)
};

const cs_report_meta_title = /** @type {(inputs: Report_Meta_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`MetaCleaner — Detailní report čištění`)
};

/**
* | output |
* | --- |
* | "MetaCleaner — Detailed Cleaning Report" |
*
* @param {Report_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_title = /** @type {((inputs?: Report_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_meta_title(inputs)
	return cs_report_meta_title(inputs)
});
export { report_meta_title as "report.meta.title" }