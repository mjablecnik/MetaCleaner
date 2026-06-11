/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Validation_Passwordmin81Inputs */

const en_auth_common_validation_passwordmin81 = /** @type {(inputs: Auth_Common_Validation_Passwordmin81Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password must be at least 8 characters.`)
};

const cs_auth_common_validation_passwordmin81 = /** @type {(inputs: Auth_Common_Validation_Passwordmin81Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Heslo musí mít alespoň 8 znaků.`)
};

/**
* | output |
* | --- |
* | "Password must be at least 8 characters." |
*
* @param {Auth_Common_Validation_Passwordmin81Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_validation_passwordmin81 = /** @type {((inputs?: Auth_Common_Validation_Passwordmin81Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Validation_Passwordmin81Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_validation_passwordmin81(inputs)
	return cs_auth_common_validation_passwordmin81(inputs)
});
export { auth_common_validation_passwordmin81 as "auth.common.validation.passwordMin8" }