/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Nav_Loggedinas2Inputs */

const en_common_nav_loggedinas2 = /** @type {(inputs: Common_Nav_Loggedinas2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Logged in as`)
};

const cs_common_nav_loggedinas2 = /** @type {(inputs: Common_Nav_Loggedinas2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Přihlášen jako`)
};

/**
* | output |
* | --- |
* | "Logged in as" |
*
* @param {Common_Nav_Loggedinas2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_nav_loggedinas2 = /** @type {((inputs?: Common_Nav_Loggedinas2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Nav_Loggedinas2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_nav_loggedinas2(inputs)
	return cs_common_nav_loggedinas2(inputs)
});
export { common_nav_loggedinas2 as "common.nav.loggedInAs" }