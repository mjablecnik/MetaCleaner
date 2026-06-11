/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Nav_LanguageInputs */

const en_common_nav_language = /** @type {(inputs: Common_Nav_LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Language`)
};

const cs_common_nav_language = /** @type {(inputs: Common_Nav_LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Jazyk`)
};

/**
* | output |
* | --- |
* | "Language" |
*
* @param {Common_Nav_LanguageInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_nav_language = /** @type {((inputs?: Common_Nav_LanguageInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Nav_LanguageInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_nav_language(inputs)
	return cs_common_nav_language(inputs)
});
export { common_nav_language as "common.nav.language" }