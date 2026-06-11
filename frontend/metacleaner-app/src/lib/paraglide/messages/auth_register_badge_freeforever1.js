/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Badge_Freeforever1Inputs */

const en_auth_register_badge_freeforever1 = /** @type {(inputs: Auth_Register_Badge_Freeforever1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Free forever · No credit card`)
};

const cs_auth_register_badge_freeforever1 = /** @type {(inputs: Auth_Register_Badge_Freeforever1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zdarma navždy · Bez kreditní karty`)
};

/**
* | output |
* | --- |
* | "Free forever · No credit card" |
*
* @param {Auth_Register_Badge_Freeforever1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_badge_freeforever1 = /** @type {((inputs?: Auth_Register_Badge_Freeforever1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Badge_Freeforever1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_badge_freeforever1(inputs)
	return cs_auth_register_badge_freeforever1(inputs)
});
export { auth_register_badge_freeforever1 as "auth.register.badge.freeForever" }