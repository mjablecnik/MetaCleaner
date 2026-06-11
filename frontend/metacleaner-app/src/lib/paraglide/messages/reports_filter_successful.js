/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Filter_SuccessfulInputs */

const en_reports_filter_successful = /** @type {(inputs: Reports_Filter_SuccessfulInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Successful`)
};

const cs_reports_filter_successful = /** @type {(inputs: Reports_Filter_SuccessfulInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Úspěšné`)
};

/**
* | output |
* | --- |
* | "Successful" |
*
* @param {Reports_Filter_SuccessfulInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_successful = /** @type {((inputs?: Reports_Filter_SuccessfulInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_SuccessfulInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_filter_successful(inputs)
	return cs_reports_filter_successful(inputs)
});
export { reports_filter_successful as "reports.filter.successful" }