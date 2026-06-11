/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Filter_VideoInputs */

const en_reports_filter_video = /** @type {(inputs: Reports_Filter_VideoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Video`)
};

const cs_reports_filter_video = /** @type {(inputs: Reports_Filter_VideoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Video`)
};

/**
* | output |
* | --- |
* | "Video" |
*
* @param {Reports_Filter_VideoInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_video = /** @type {((inputs?: Reports_Filter_VideoInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_VideoInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_filter_video(inputs)
	return cs_reports_filter_video(inputs)
});
export { reports_filter_video as "reports.filter.video" }