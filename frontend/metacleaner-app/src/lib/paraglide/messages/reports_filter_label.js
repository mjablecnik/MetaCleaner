/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Filter_LabelInputs */

const en_reports_filter_label = /** @type {(inputs: Reports_Filter_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filter:`)
};

const cs_reports_filter_label = /** @type {(inputs: Reports_Filter_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtr:`)
};

/**
* | output |
* | --- |
* | "Filter:" |
*
* @param {Reports_Filter_LabelInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_label = /** @type {((inputs?: Reports_Filter_LabelInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_LabelInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_filter_label(inputs)
	return cs_reports_filter_label(inputs)
});
export { reports_filter_label as "reports.filter.label" }