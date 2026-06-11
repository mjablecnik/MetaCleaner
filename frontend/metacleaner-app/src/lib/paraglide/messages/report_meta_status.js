/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Meta_StatusInputs */

const en_report_meta_status = /** @type {(inputs: Report_Meta_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Status`)
};

const cs_report_meta_status = /** @type {(inputs: Report_Meta_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Status`)
};

/**
* | output |
* | --- |
* | "Status" |
*
* @param {Report_Meta_StatusInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_status = /** @type {((inputs?: Report_Meta_StatusInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_StatusInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_meta_status(inputs)
	return cs_report_meta_status(inputs)
});
export { report_meta_status as "report.meta.status" }