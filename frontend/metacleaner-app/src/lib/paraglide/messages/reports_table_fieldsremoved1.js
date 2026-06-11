/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Table_Fieldsremoved1Inputs */

const en_reports_table_fieldsremoved1 = /** @type {(inputs: Reports_Table_Fieldsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`fields removed`)
};

const cs_reports_table_fieldsremoved1 = /** @type {(inputs: Reports_Table_Fieldsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`polí odstraněno`)
};

/**
* | output |
* | --- |
* | "fields removed" |
*
* @param {Reports_Table_Fieldsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_fieldsremoved1 = /** @type {((inputs?: Reports_Table_Fieldsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_Fieldsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_table_fieldsremoved1(inputs)
	return cs_reports_table_fieldsremoved1(inputs)
});
export { reports_table_fieldsremoved1 as "reports.table.fieldsRemoved" }