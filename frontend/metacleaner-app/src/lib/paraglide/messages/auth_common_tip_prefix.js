/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Tip_PrefixInputs */

const en_auth_common_tip_prefix = /** @type {(inputs: Auth_Common_Tip_PrefixInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tip:`)
};

const cs_auth_common_tip_prefix = /** @type {(inputs: Auth_Common_Tip_PrefixInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tip:`)
};

/**
* | output |
* | --- |
* | "Tip:" |
*
* @param {Auth_Common_Tip_PrefixInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_tip_prefix = /** @type {((inputs?: Auth_Common_Tip_PrefixInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Tip_PrefixInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_tip_prefix(inputs)
	return cs_auth_common_tip_prefix(inputs)
});
export { auth_common_tip_prefix as "auth.common.tip.prefix" }