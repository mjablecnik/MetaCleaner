/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Filecount_One1Inputs */

const en_reports_filecount_one1 = /** @type {(inputs: Reports_Filecount_One1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 file`)
};

const cs_reports_filecount_one1 = /** @type {(inputs: Reports_Filecount_One1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 soubor`)
};

/**
* | output |
* | --- |
* | "1 file" |
*
* @param {Reports_Filecount_One1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filecount_one1 = /** @type {((inputs?: Reports_Filecount_One1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filecount_One1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_filecount_one1(inputs)
	return cs_reports_filecount_one1(inputs)
});
export { reports_filecount_one1 as "reports.fileCount.one" }