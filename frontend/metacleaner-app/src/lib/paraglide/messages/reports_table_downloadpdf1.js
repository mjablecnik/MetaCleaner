/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Table_Downloadpdf1Inputs */

const en_reports_table_downloadpdf1 = /** @type {(inputs: Reports_Table_Downloadpdf1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Download PDF`)
};

const cs_reports_table_downloadpdf1 = /** @type {(inputs: Reports_Table_Downloadpdf1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stáhnout PDF`)
};

/**
* | output |
* | --- |
* | "Download PDF" |
*
* @param {Reports_Table_Downloadpdf1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_downloadpdf1 = /** @type {((inputs?: Reports_Table_Downloadpdf1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_Downloadpdf1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_table_downloadpdf1(inputs)
	return cs_reports_table_downloadpdf1(inputs)
});
export { reports_table_downloadpdf1 as "reports.table.downloadPdf" }