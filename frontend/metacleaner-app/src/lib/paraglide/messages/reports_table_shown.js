/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ filtered: NonNullable<unknown>, total: NonNullable<unknown> }} Reports_Table_ShownInputs */

const en_reports_table_shown = /** @type {(inputs: Reports_Table_ShownInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Shown ${i?.filtered} of ${i?.total}`)
};

const cs_reports_table_shown = /** @type {(inputs: Reports_Table_ShownInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Zobrazeno ${i?.filtered} z ${i?.total}`)
};

/**
* | output |
* | --- |
* | "Shown {filtered} of {total}" |
*
* @param {Reports_Table_ShownInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_shown = /** @type {((inputs: Reports_Table_ShownInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_ShownInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_table_shown(inputs)
	return cs_reports_table_shown(inputs)
});
export { reports_table_shown as "reports.table.shown" }