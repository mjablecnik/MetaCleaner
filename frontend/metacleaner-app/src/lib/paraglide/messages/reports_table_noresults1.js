/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Table_Noresults1Inputs */

const en_reports_table_noresults1 = /** @type {(inputs: Reports_Table_Noresults1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No reports match your search.`)
};

const cs_reports_table_noresults1 = /** @type {(inputs: Reports_Table_Noresults1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Žádné reporty neodpovídají vašemu hledání.`)
};

/**
* | output |
* | --- |
* | "No reports match your search." |
*
* @param {Reports_Table_Noresults1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_noresults1 = /** @type {((inputs?: Reports_Table_Noresults1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_Noresults1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_table_noresults1(inputs)
	return cs_reports_table_noresults1(inputs)
});
export { reports_table_noresults1 as "reports.table.noResults" }