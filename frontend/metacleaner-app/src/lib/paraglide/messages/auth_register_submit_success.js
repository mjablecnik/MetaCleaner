/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Submit_SuccessInputs */

const en_auth_register_submit_success = /** @type {(inputs: Auth_Register_Submit_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account created!`)
};

const cs_auth_register_submit_success = /** @type {(inputs: Auth_Register_Submit_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Účet vytvořen!`)
};

/**
* | output |
* | --- |
* | "Account created!" |
*
* @param {Auth_Register_Submit_SuccessInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_submit_success = /** @type {((inputs?: Auth_Register_Submit_SuccessInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Submit_SuccessInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_submit_success(inputs)
	return cs_auth_register_submit_success(inputs)
});
export { auth_register_submit_success as "auth.register.submit.success" }