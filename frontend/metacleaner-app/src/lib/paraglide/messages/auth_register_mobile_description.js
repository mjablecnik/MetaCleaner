/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Mobile_DescriptionInputs */

const en_auth_register_mobile_description = /** @type {(inputs: Auth_Register_Mobile_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove metadata from photos and videos. No fees, no tracking.`)
};

const cs_auth_register_mobile_description = /** @type {(inputs: Auth_Register_Mobile_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Odstraňte metadata z fotek a videí. Žádné poplatky, žádné sledování.`)
};

/**
* | output |
* | --- |
* | "Remove metadata from photos and videos. No fees, no tracking." |
*
* @param {Auth_Register_Mobile_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_mobile_description = /** @type {((inputs?: Auth_Register_Mobile_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Mobile_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_mobile_description(inputs)
	return cs_auth_register_mobile_description(inputs)
});
export { auth_register_mobile_description as "auth.register.mobile.description" }