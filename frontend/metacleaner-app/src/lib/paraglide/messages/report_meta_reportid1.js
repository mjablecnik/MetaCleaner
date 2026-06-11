/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Meta_Reportid1Inputs */

const en_report_meta_reportid1 = /** @type {(inputs: Report_Meta_Reportid1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Report ID`)
};

const cs_report_meta_reportid1 = /** @type {(inputs: Report_Meta_Reportid1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ID reportu`)
};

/**
* | output |
* | --- |
* | "Report ID" |
*
* @param {Report_Meta_Reportid1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_reportid1 = /** @type {((inputs?: Report_Meta_Reportid1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_Reportid1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_meta_reportid1(inputs)
	return cs_report_meta_reportid1(inputs)
});
export { report_meta_reportid1 as "report.meta.reportId" }