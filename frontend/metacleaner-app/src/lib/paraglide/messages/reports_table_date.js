/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Table_DateInputs */

const en_reports_table_date = /** @type {(inputs: Reports_Table_DateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date`)
};

const cs_reports_table_date = /** @type {(inputs: Reports_Table_DateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Datum`)
};

/**
* | output |
* | --- |
* | "Date" |
*
* @param {Reports_Table_DateInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_date = /** @type {((inputs?: Reports_Table_DateInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_DateInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_table_date(inputs)
	return cs_reports_table_date(inputs)
});
export { reports_table_date as "reports.table.date" }