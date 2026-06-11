/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Table_TitleInputs */

const en_reports_table_title = /** @type {(inputs: Reports_Table_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Report list`)
};

const cs_reports_table_title = /** @type {(inputs: Reports_Table_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seznam reportů`)
};

/**
* | output |
* | --- |
* | "Report list" |
*
* @param {Reports_Table_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_title = /** @type {((inputs?: Reports_Table_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_table_title(inputs)
	return cs_reports_table_title(inputs)
});
export { reports_table_title as "reports.table.title" }