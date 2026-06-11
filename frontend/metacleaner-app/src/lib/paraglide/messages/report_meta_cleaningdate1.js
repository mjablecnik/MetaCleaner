/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Meta_Cleaningdate1Inputs */

const en_report_meta_cleaningdate1 = /** @type {(inputs: Report_Meta_Cleaningdate1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cleaning date`)
};

const cs_report_meta_cleaningdate1 = /** @type {(inputs: Report_Meta_Cleaningdate1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Datum čištění`)
};

/**
* | output |
* | --- |
* | "Cleaning date" |
*
* @param {Report_Meta_Cleaningdate1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_cleaningdate1 = /** @type {((inputs?: Report_Meta_Cleaningdate1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_Cleaningdate1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_meta_cleaningdate1(inputs)
	return cs_report_meta_cleaningdate1(inputs)
});
export { report_meta_cleaningdate1 as "report.meta.cleaningDate" }