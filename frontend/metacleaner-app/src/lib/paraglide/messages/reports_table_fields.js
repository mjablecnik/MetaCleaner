/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Table_FieldsInputs */

const en_reports_table_fields = /** @type {(inputs: Reports_Table_FieldsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fields`)
};

const cs_reports_table_fields = /** @type {(inputs: Reports_Table_FieldsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pole`)
};

/**
* | output |
* | --- |
* | "Fields" |
*
* @param {Reports_Table_FieldsInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_fields = /** @type {((inputs?: Reports_Table_FieldsInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_FieldsInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_table_fields(inputs)
	return cs_reports_table_fields(inputs)
});
export { reports_table_fields as "reports.table.fields" }