/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Meta_Statussuccessmobile2Inputs */

const en_report_meta_statussuccessmobile2 = /** @type {(inputs: Report_Meta_Statussuccessmobile2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`100% Completed`)
};

const cs_report_meta_statussuccessmobile2 = /** @type {(inputs: Report_Meta_Statussuccessmobile2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`100% Dokončeno`)
};

/**
* | output |
* | --- |
* | "100% Completed" |
*
* @param {Report_Meta_Statussuccessmobile2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_statussuccessmobile2 = /** @type {((inputs?: Report_Meta_Statussuccessmobile2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_Statussuccessmobile2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_meta_statussuccessmobile2(inputs)
	return cs_report_meta_statussuccessmobile2(inputs)
});
export { report_meta_statussuccessmobile2 as "report.meta.statusSuccessMobile" }