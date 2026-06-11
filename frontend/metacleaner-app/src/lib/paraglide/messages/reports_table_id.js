/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Table_IdInputs */

const en_reports_table_id = /** @type {(inputs: Reports_Table_IdInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ID`)
};

const cs_reports_table_id = /** @type {(inputs: Reports_Table_IdInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ID`)
};

/**
* | output |
* | --- |
* | "ID" |
*
* @param {Reports_Table_IdInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_id = /** @type {((inputs?: Reports_Table_IdInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_IdInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_table_id(inputs)
	return cs_reports_table_id(inputs)
});
export { reports_table_id as "reports.table.id" }