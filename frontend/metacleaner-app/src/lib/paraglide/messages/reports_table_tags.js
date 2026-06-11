/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Table_TagsInputs */

const en_reports_table_tags = /** @type {(inputs: Reports_Table_TagsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tags`)
};

const cs_reports_table_tags = /** @type {(inputs: Reports_Table_TagsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tagy`)
};

/**
* | output |
* | --- |
* | "Tags" |
*
* @param {Reports_Table_TagsInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_tags = /** @type {((inputs?: Reports_Table_TagsInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_TagsInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_table_tags(inputs)
	return cs_reports_table_tags(inputs)
});
export { reports_table_tags as "reports.table.tags" }