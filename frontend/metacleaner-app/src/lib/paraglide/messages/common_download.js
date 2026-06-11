/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_DownloadInputs */

const en_common_download = /** @type {(inputs: Common_DownloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Download`)
};

const cs_common_download = /** @type {(inputs: Common_DownloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stáhnout`)
};

/**
* | output |
* | --- |
* | "Download" |
*
* @param {Common_DownloadInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_download = /** @type {((inputs?: Common_DownloadInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_DownloadInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_download(inputs)
	return cs_common_download(inputs)
});
export { common_download as "common.download" }