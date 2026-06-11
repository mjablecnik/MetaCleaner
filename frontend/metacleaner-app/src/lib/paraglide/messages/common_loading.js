/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_LoadingInputs */

const en_common_loading = /** @type {(inputs: Common_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading...`)
};

const cs_common_loading = /** @type {(inputs: Common_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Načítám...`)
};

/**
* | output |
* | --- |
* | "Loading..." |
*
* @param {Common_LoadingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_loading = /** @type {((inputs?: Common_LoadingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_LoadingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_loading(inputs)
	return cs_common_loading(inputs)
});
export { common_loading as "common.loading" }