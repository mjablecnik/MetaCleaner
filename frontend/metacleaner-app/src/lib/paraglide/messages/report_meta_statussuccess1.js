/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Meta_Statussuccess1Inputs */

const en_report_meta_statussuccess1 = /** @type {(inputs: Report_Meta_Statussuccess1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`100% Successfully completed`)
};

const cs_report_meta_statussuccess1 = /** @type {(inputs: Report_Meta_Statussuccess1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`100% Úspěšně dokončeno`)
};

/**
* | output |
* | --- |
* | "100% Successfully completed" |
*
* @param {Report_Meta_Statussuccess1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_statussuccess1 = /** @type {((inputs?: Report_Meta_Statussuccess1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_Statussuccess1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_meta_statussuccess1(inputs)
	return cs_report_meta_statussuccess1(inputs)
});
export { report_meta_statussuccess1 as "report.meta.statusSuccess" }