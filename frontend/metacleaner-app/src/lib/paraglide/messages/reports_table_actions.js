/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Table_ActionsInputs */

const en_reports_table_actions = /** @type {(inputs: Reports_Table_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actions`)
};

const cs_reports_table_actions = /** @type {(inputs: Reports_Table_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Akce`)
};

/**
* | output |
* | --- |
* | "Actions" |
*
* @param {Reports_Table_ActionsInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_actions = /** @type {((inputs?: Reports_Table_ActionsInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_ActionsInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_table_actions(inputs)
	return cs_reports_table_actions(inputs)
});
export { reports_table_actions as "reports.table.actions" }