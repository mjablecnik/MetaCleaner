/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reports_Toast_DownloadingInputs */

const en_reports_toast_downloading = /** @type {(inputs: Reports_Toast_DownloadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Downloading:`)
};

const cs_reports_toast_downloading = /** @type {(inputs: Reports_Toast_DownloadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stahování:`)
};

/**
* | output |
* | --- |
* | "Downloading:" |
*
* @param {Reports_Toast_DownloadingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_toast_downloading = /** @type {((inputs?: Reports_Toast_DownloadingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Toast_DownloadingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reports_toast_downloading(inputs)
	return cs_reports_toast_downloading(inputs)
});
export { reports_toast_downloading as "reports.toast.downloading" }