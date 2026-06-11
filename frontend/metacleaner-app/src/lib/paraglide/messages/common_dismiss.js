/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_DismissInputs */

const en_common_dismiss = /** @type {(inputs: Common_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dismiss`)
};

const cs_common_dismiss = /** @type {(inputs: Common_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zavřít`)
};

/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Common_DismissInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_dismiss = /** @type {((inputs?: Common_DismissInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_DismissInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_dismiss(inputs)
	return cs_common_dismiss(inputs)
});
export { common_dismiss as "common.dismiss" }