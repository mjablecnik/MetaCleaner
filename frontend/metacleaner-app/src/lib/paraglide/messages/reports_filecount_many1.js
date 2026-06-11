/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Reports_Filecount_Many1Inputs */

const en_reports_filecount_many1 = /** @type {(inputs: Reports_Filecount_Many1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} files`)
};

const cs_reports_filecount_many1 = /** @type {(inputs: Reports_Filecount_Many1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} souborů`)
};

/**
* | output |
* | --- |
* | "{count} files" |
*
* @param {Reports_Filecount_Many1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filecount_many1 = /** @type {((inputs: Reports_Filecount_Many1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filecount_Many1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_filecount_many1(inputs)
	return cs_reports_filecount_many1(inputs)
});
export { reports_filecount_many1 as "reports.fileCount.many" }