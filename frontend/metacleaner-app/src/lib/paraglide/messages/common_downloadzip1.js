/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Downloadzip1Inputs */

const en_common_downloadzip1 = /** @type {(inputs: Common_Downloadzip1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Download all (ZIP)`)
};

const cs_common_downloadzip1 = /** @type {(inputs: Common_Downloadzip1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stáhnout vše (ZIP)`)
};

/**
* | output |
* | --- |
* | "Download all (ZIP)" |
*
* @param {Common_Downloadzip1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_downloadzip1 = /** @type {((inputs?: Common_Downloadzip1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Downloadzip1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_downloadzip1(inputs)
	return cs_common_downloadzip1(inputs)
});
export { common_downloadzip1 as "common.downloadZip" }