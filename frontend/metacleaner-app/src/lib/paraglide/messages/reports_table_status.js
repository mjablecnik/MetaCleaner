/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Table_StatusInputs */

const en_reports_table_status = /** @type {(inputs: Reports_Table_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Status`)
};

const cs_reports_table_status = /** @type {(inputs: Reports_Table_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Status`)
};

/**
* | output |
* | --- |
* | "Status" |
*
* @param {Reports_Table_StatusInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_status = /** @type {((inputs?: Reports_Table_StatusInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_StatusInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_table_status(inputs)
	return cs_reports_table_status(inputs)
});
export { reports_table_status as "reports.table.status" }