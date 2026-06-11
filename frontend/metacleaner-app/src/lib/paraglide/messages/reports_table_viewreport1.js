/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Table_Viewreport1Inputs */

const en_reports_table_viewreport1 = /** @type {(inputs: Reports_Table_Viewreport1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View report`)
};

const cs_reports_table_viewreport1 = /** @type {(inputs: Reports_Table_Viewreport1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zobrazit report`)
};

/**
* | output |
* | --- |
* | "View report" |
*
* @param {Reports_Table_Viewreport1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_viewreport1 = /** @type {((inputs?: Reports_Table_Viewreport1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_Viewreport1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_table_viewreport1(inputs)
	return cs_reports_table_viewreport1(inputs)
});
export { reports_table_viewreport1 as "reports.table.viewReport" }