/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Table_FilesInputs */

const en_reports_table_files = /** @type {(inputs: Reports_Table_FilesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files`)
};

const cs_reports_table_files = /** @type {(inputs: Reports_Table_FilesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Soubory`)
};

/**
* | output |
* | --- |
* | "Files" |
*
* @param {Reports_Table_FilesInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_files = /** @type {((inputs?: Reports_Table_FilesInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_FilesInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_table_files(inputs)
	return cs_reports_table_files(inputs)
});
export { reports_table_files as "reports.table.files" }